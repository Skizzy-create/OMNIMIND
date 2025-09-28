import os
import io
import json
import tempfile
import subprocess
import re
from typing import List, Optional, Dict, Any, Tuple
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from PIL import Image
import time
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# External deps
import uuid
import requests

# S3-compatible (Akave O3)
import boto3
from botocore.client import Config

# MongoDB (fallback)
from pymongo import MongoClient
from pymongo.errors import CollectionInvalid
from bson import ObjectId

# Lighthouse SDK
try:
    from lighthouseweb3 import Lighthouse  # pip install lighthouseweb3
except Exception:
    Lighthouse = None

app = FastAPI(title="Multimodal Demo Server")

# --------------------- Configuration & Globals ---------------------
# For Mistral and photo processing: 30 cores
MISTRAL_THREADS = int(os.environ.get("MISTRAL_THREADS", "30"))
# For embeddings: 16 cores
EMBEDDING_THREADS = int(os.environ.get("EMBEDDING_THREADS", "16"))

# Set default threads for different operations
os.environ.setdefault("OMP_NUM_THREADS", str(MISTRAL_THREADS))
os.environ.setdefault("MKL_NUM_THREADS", str(MISTRAL_THREADS))

LLAMA_CPP_BIN = os.environ.get("LLAMA_CPP_BIN", "./llama_cpp/build/bin/llama-cli")
MISTRAL_GGUF = os.environ.get("MISTRAL_GGUF", "./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf")

PIXTRAL_HTTP_URL = os.environ.get("PIXTRAL_HTTP_URL")
OLLAMA_HTTP_URL = os.environ.get("OLLAMA_HTTP_URL")
OLLAMA_MODEL_PIXTRAL = os.environ.get("OLLAMA_MODEL_PIXTRAL", "pixtral")
OLLAMA_MODEL_MISTRAL = os.environ.get("OLLAMA_MODEL_MISTRAL", "mistral")

_small_embedder = None
_large_embedder = None
_blip_processor = None
_blip_model = None

# --------------------- RAG Cache System ---------------------
class RAGCache:
    def __init__(self):
        self.cache = {}
        self.expiry_time = 30  # seconds
    
    def get_key(self, embeddings: List[List[float]]):
        """Generate a hash key from embeddings"""
        if not embeddings:
            return None
        # Use first few values and length as key (simplified hash)
        key_parts = [len(embeddings)]
        if embeddings and len(embeddings[0]) >= 5:
            key_parts.extend([round(x, 4) for x in embeddings[0][:5]])
        return tuple(key_parts)
    
    def get(self, key):
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['timestamp'] < self.expiry_time:
                return entry['context']
        return None
    
    def set(self, key, context):
        self.cache[key] = {
            'context': context,
            'timestamp': time.time()
        }
        # Clean up expired entries
        self._cleanup()
    
    def _cleanup(self):
        current_time = time.time()
        expired_keys = [k for k, v in self.cache.items() 
                       if current_time - v['timestamp'] >= self.expiry_time]
        for key in expired_keys:
            del self.cache[key]

# Initialize RAG cache
rag_cache = RAGCache()

# --------------------- Utilities ---------------------
def set_torch_threads(n: int):
    """Set torch threads for different operations"""
    try:
        import torch
        torch.set_num_threads(n)
        torch.set_num_interop_threads(n)
    except Exception:
        pass

def lazy_load_small_embedder():
    global _small_embedder
    if _small_embedder is None:
        from sentence_transformers import SentenceTransformer
        _small_embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _small_embedder

def lazy_load_large_embedder():
    global _large_embedder
    if _large_embedder is None:
        from sentence_transformers import SentenceTransformer
        _large_embedder = SentenceTransformer("intfloat/e5-large-v2")
    return _large_embedder

def lazy_load_blip():
    global _blip_processor, _blip_model
    if _blip_processor is None or _blip_model is None:
        from transformers import BlipProcessor, BlipForConditionalGeneration
        model_name = os.environ.get("BLIP_MODEL", "Salesforce/blip-image-captioning-large")
        _blip_processor = BlipProcessor.from_pretrained(model_name)
        _blip_model = BlipForConditionalGeneration.from_pretrained(model_name)
        try:
            import torch
            _blip_model.to("cpu")
            _blip_model.eval()
        except Exception:
            pass
    return _blip_processor, _blip_model

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    try:
        import fitz
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        texts = []
        for page in doc:
            texts.append(page.get_text("text"))
        return "\n\n".join(texts)
    except Exception as e:
        raise RuntimeError(f"PDF text extraction failed: {e}")

def call_pixtral_http(image_bytes: Optional[bytes], pdf_text: Optional[str], system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    if not PIXTRAL_HTTP_URL:
        raise RuntimeError("PIXTRAL_HTTP_URL not configured")
    import base64
    payload = {
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "pdf_text": pdf_text,
    }
    if image_bytes:
        payload["image_bytes_base64"] = base64.b64encode(image_bytes).decode("ascii")
    resp = requests.post(PIXTRAL_HTTP_URL, json=payload, timeout=60)
    if resp.status_code != 200:
        raise RuntimeError(f"Pixtral HTTP call failed: {resp.status_code} {resp.text}")
    return resp.json()

def caption_with_blip(image_bytes: bytes, caption_instructions: Optional[str] = None) -> Dict[str, Any]:
    processor, model = lazy_load_blip()
    import torch
    set_torch_threads(MISTRAL_THREADS)  # Use 30 cores for image processing
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        out_ids = model.generate(**inputs, max_new_tokens=64)
    caption = processor.decode(out_ids[0], skip_special_tokens=True)
    return {"caption": caption, "short_answer": caption, "objects": []}

def run_mistral_llama_cpp(prompt: str, threads: int = MISTRAL_THREADS, max_tokens: int = 512) -> str:
    """Updated to use correct llama-cli arguments for your build - uses 30 cores"""
    cmd = [
        LLAMA_CPP_BIN, 
        "-m", MISTRAL_GGUF, 
        "--threads", str(threads), 
        "-n", str(max_tokens), 
        "--repeat-penalty", "1.1", 
        "--temp", "0.7", 
        "--top-k", "40", 
        "--top-p", "0.95", 
        "-p", prompt
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        out = proc.stdout.strip() or proc.stderr.strip()
        if "invalid argument" in out or "unrecognized" in out:
            # Try with ctx argument if no error without it
            cmd_with_ctx = cmd[:7] + ["-c", "2048"] + cmd[7:]  # Insert ctx after model
            proc = subprocess.run(cmd_with_ctx, capture_output=True, text=True, timeout=180)
            out = proc.stdout.strip() or proc.stderr.strip()
        return out
    except subprocess.TimeoutExpired:
        return "Error: Mistral inference timed out."
    except FileNotFoundError:
        raise RuntimeError(f"llama.cpp binary not found at {LLAMA_CPP_BIN}. Set LLAMA_CPP_BIN env var.")

def run_mistral_via_http(prompt: str, model: str = OLLAMA_MODEL_MISTRAL) -> str:
    if not OLLAMA_HTTP_URL:
        raise RuntimeError("OLLAMA_HTTP_URL not configured")
    payload = {"model": model, "prompt": prompt}
    resp = requests.post(OLLAMA_HTTP_URL, json=payload, timeout=60)
    if resp.status_code != 200:
        raise RuntimeError(f"Inference HTTP call failed: {resp.status_code} {resp.text}")
    data = resp.json()
    return data.get("output") or data.get("result") or json.dumps(data)

def run_mistral(prompt: str) -> str:
    if OLLAMA_HTTP_URL:
        try:
            return run_mistral_via_http(prompt)
        except Exception as e:
            print(f"OLLAMA HTTP call failed, falling back to llama.cpp: {e}")
    return run_mistral_llama_cpp(prompt)

def run_mistral_max(prompt: str, max_tokens: int = 1024) -> str:
    if not OLLAMA_HTTP_URL:
        return run_mistral_llama_cpp(prompt, threads=MISTRAL_THREADS, max_tokens=max_tokens)
    return run_mistral(prompt)

# --------------------- Akave O3 (S3-compatible) or Mongo fallback ---------------------
AKAVE_O3_ENDPOINT = os.environ.get("AKAVE_O3_ENDPOINT")
AKAVE_O3_ACCESS_KEY_ID = os.environ.get("AKAVE_O3_ACCESS_KEY_ID")
AKAVE_O3_SECRET_ACCESS_KEY = os.environ.get("AKAVE_O3_SECRET_ACCESS_KEY")
AKAVE_O3_REGION = os.environ.get("AKAVE_O3_REGION", "us-east-1")
AKAVE_O3_BUCKET = os.environ.get("AKAVE_O3_BUCKET", "aikg")

def has_o3_config() -> bool:
    return bool(AKAVE_O3_ENDPOINT and AKAVE_O3_ACCESS_KEY_ID and AKAVE_O3_SECRET_ACCESS_KEY)

def get_o3_client():
    if not has_o3_config():
        raise RuntimeError("Akave O3 S3 config missing env vars")
    return boto3.client(
        "s3",
        endpoint_url=AKAVE_O3_ENDPOINT,
        aws_access_key_id=AKAVE_O3_ACCESS_KEY_ID,
        aws_secret_access_key=AKAVE_O3_SECRET_ACCESS_KEY,
        config=Config(s3={"addressing_style": "path"}),
        region_name=AKAVE_O3_REGION,
    )

def ensure_o3_bucket():
    s3 = get_o3_client()
    try:
        s3.head_bucket(Bucket=AKAVE_O3_BUCKET)
    except Exception:
        s3.create_bucket(Bucket=AKAVE_O3_BUCKET)

def gen_kg_id(custom: Optional[str] = None) -> str:
    return custom if custom else uuid.uuid4().hex

def store_kg_to_o3(kg_json: Dict[str, Any], kg_id: str, key_prefix: str = "kg/") -> Dict[str, str]:
    ensure_o3_bucket()
    s3 = get_o3_client()
    key = f"{key_prefix}{kg_id}.json"
    s3.put_object(
        Bucket=AKAVE_O3_BUCKET,
        Key=key,
        Body=json.dumps(kg_json, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )
    return {"type": "o3", "bucket": AKAVE_O3_BUCKET, "key": key, "kg_id": kg_id}

# MongoDB fallback
MONGODB_URI = os.environ.get("MONGODB_URI")
MONGODB_DB = os.environ.get("MONGODB_DB", "aikg")
MONGODB_COLLECTION = os.environ.get("MONGODB_COLLECTION", "knowledge_graphs")

def get_mongo_client() -> MongoClient:
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI not configured")
    return MongoClient(MONGODB_URI)

def ensure_mongo_collection():
    client = get_mongo_client()
    db = client[MONGODB_DB]
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["nodes", "edges", "metadata"],
            "properties": {
                "nodes": {"bsonType": "array"},
                "edges": {"bsonType": "array"},
                "metadata": {"bsonType": "object"},
            },
        }
    }
    try:
        db.create_collection(MONGODB_COLLECTION, validator=validator)
    except CollectionInvalid:
        try:
            db.command({"collMod": MONGODB_COLLECTION, "validator": validator})
        except Exception:
            pass
    return db[MONGODB_COLLECTION]

def store_kg_to_mongo(kg_json: Dict[str, Any], kg_id: Optional[str] = None) -> Dict[str, str]:
    coll = ensure_mongo_collection()
    doc = dict(kg_json)
    if kg_id:
        doc["_id"] = kg_id
    result = coll.insert_one(doc)
    return {"type": "mongo", "collection": MONGODB_COLLECTION, "kg_id": str(result.inserted_id)}

def fetch_kg_from_mongo(collection: str, id_str: str) -> Dict[str, Any]:
    client = get_mongo_client()
    db = client[MONGODB_DB]
    coll = db[collection]
    query_id: Any
    try:
        query_id = ObjectId(id_str)
    except Exception:
        query_id = id_str
    doc = coll.find_one({"_id": query_id})
    if not doc:
        raise RuntimeError("KG not found in MongoDB")
    doc.pop("_id", None)
    return doc

# --------------------- Lighthouse (embeddings storage) - SDK ONLY ---------------------
LIGHTHOUSE_TOKEN = os.environ.get("LIGHTHOUSE_TOKEN")

def store_embeddings_to_lighthouse(payload: Dict[str, Any]) -> str:
    if Lighthouse is None:
        raise RuntimeError("lighthouseweb3 not installed")
    if not LIGHTHOUSE_TOKEN:
        raise RuntimeError("LIGHTHOUSE_TOKEN not configured")
    
    # Fix: Open temp file in text mode
    with tempfile.NamedTemporaryFile(mode='w+t', delete=False, suffix=".json", encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        temp_path = f.name
    
    try:
        lh = Lighthouse(token=LIGHTHOUSE_TOKEN)
        resp = lh.upload(temp_path)
    finally:
        try:
            os.unlink(temp_path)
        except Exception:
            pass
    
    cid = None
    if isinstance(resp, dict):
        cid = resp.get("Hash") or resp.get("cid") or resp.get("Cid") or (resp.get("data") or {}).get("Hash")
    if not cid:
        raise RuntimeError(f"Unexpected Lighthouse response: {resp}")
    return cid

def fetch_json_from_lighthouse_cid(cid: str) -> Dict[str, Any]:
    if not LIGHTHOUSE_TOKEN:
        raise RuntimeError("LIGHTHOUSE_TOKEN not configured")
    
    if Lighthouse is None:
        raise RuntimeError("lighthouseweb3 not installed")
    
    try:
        lh = Lighthouse(token=LIGHTHOUSE_TOKEN)
        file_content = lh.download(cid)
        
        # Handle different return types from the SDK
        if isinstance(file_content, tuple):
            content = file_content[0]
        else:
            content = file_content
        
        # Convert to string if it's bytes
        if isinstance(content, bytes):
            content = content.decode('utf-8')
        
        # Parse JSON
        return json.loads(content)
    except Exception as e:
        raise RuntimeError(f"Failed to download from Lighthouse CID {cid}: {e}")

# --------------------- data_id helpers ---------------------
def build_data_id(embedding_cid: str, loc: Dict[str, str]) -> str:
    """
    data_id encodes where the KG lives:
    - O3:    <CID>::o3:<bucket>/<key>
    - Mongo: <CID>::mongo:<collection>/<kg_id>
    """
    if loc.get("type") == "o3":
        return f"{embedding_cid}::o3:{loc['bucket']}/{loc['key']}"
    if loc.get("type") == "mongo":
        return f"{embedding_cid}::mongo:{loc['collection']}/{loc['kg_id']}"
    raise ValueError("Unknown KG location type")

def parse_data_id(data_id: str) -> Tuple[str, str, str, str]:
    """
    Returns (cid, scheme, part1, part2)
    - If scheme == 'o3',    part1=bucket,      part2=key
    - If scheme == 'mongo', part1=collection,  part2=kg_id
    """
    parts = data_id.split("::", 1)
    if len(parts) != 2:
        raise ValueError("Invalid data_id format")
    cid = parts[0]
    rest = parts[1]
    if ":" not in rest:
        raise ValueError("Missing scheme in data_id")
    scheme, path = rest.split(":", 1)
    if "/" not in path:
        raise ValueError("Invalid path in data_id")
    p1, p2 = path.split("/", 1)
    return cid, scheme, p1, p2

# --------------------- Improved Knowledge Graph Generation ---------------------
def generate_kg_from_texts(chunks: List[str], source_type: str = "text") -> Dict[str, Any]:
    joined = "\n\n".join(chunks[:1500])  # Limit input size
    
    # STRICT JSON schema prompt
    sys = (
        "You are a JSON knowledge graph generator. Output ONLY valid JSON matching this EXACT schema:\n"
        "{\n"
        '  "nodes": [{"id": "node1", "type": "concept", "label": "example"}],\n'
        '  "edges": [{"source": "node1", "target": "node2", "relation": "relates_to", "evidence": "quote"}]\n'
        "}\n"
        "RULES:\n"
        "- Output ONLY the JSON object, no other text\n"
        "- Always include at least 2 nodes and 1 edge\n" 
        "- Use simple node IDs like 'node1', 'node2', etc\n"
        "- Keep labels under 50 characters\n"
        "- Extract actual concepts from the text"
    )
    
    prompt = f"[SYSTEM]\n{sys}\n\n[USER]\nText:\n{joined}\n\nJSON:"
    
    try:
        # Use the max token version for better output
        raw = run_mistral_max(prompt, max_tokens=800)
        
        # More aggressive JSON extraction
        txt = raw.strip()
        
        # Find JSON boundaries more reliably
        start_idx = -1
        brace_count = 0
        for i, char in enumerate(txt):
            if char == '{':
                if start_idx == -1:
                    start_idx = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start_idx != -1:
                    json_str = txt[start_idx:i+1]
                    try:
                        kg = json.loads(json_str)
                        # Validate structure
                        if isinstance(kg.get("nodes"), list) and isinstance(kg.get("edges"), list):
                            if len(kg["nodes"]) > 0:  # Must have at least some nodes
                                kg["metadata"] = {
                                    "schema": "aikg-v1",
                                    "created_at": int(time.time() * 1000),
                                    "source": source_type,
                                    "method": "mistral"
                                }
                                print(f"✅ KG Success: {len(kg['nodes'])} nodes, {len(kg['edges'])} edges")
                                return kg
                    except json.JSONDecodeError:
                        continue
        
        # If we get here, JSON parsing failed
        print(f"❌ Mistral JSON failed. Raw output: {raw[:200]}...")
        
    except Exception as e:
        print(f"❌ Mistral error: {e}")
    
    # RELIABLE FALLBACK - Always generates valid KG
    print("🔄 Using reliable fallback KG generator")
    
    # Extract keywords from text for nodes
    words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', joined)  # Capitalized words/phrases
    unique_words = list(set(words[:10]))  # Top 10 unique concepts
    
    nodes = []
    edges = []
    
    # Create nodes from key concepts
    for i, word in enumerate(unique_words[:6]):  # Limit to 6 nodes
        nodes.append({
            "id": f"concept_{i+1}",
            "type": "concept",
            "label": word[:50]
        })
    
    # Create edges between consecutive concepts
    for i in range(len(nodes) - 1):
        edges.append({
            "source": nodes[i]["id"],
            "target": nodes[i+1]["id"], 
            "relation": "related_to",
            "evidence": f"Co-occurring concepts in {source_type}"
        })
    
    # If no good concepts found, use text chunks
    if len(nodes) == 0:
        for i, chunk in enumerate(chunks[:3]):
            nodes.append({
                "id": f"text_{i+1}",
                "type": "text_segment",
                "label": chunk[:50] + "..." if len(chunk) > 50 else chunk
            })
            
        for i in range(len(nodes) - 1):
            edges.append({
                "source": f"text_{i+1}",
                "target": f"text_{i+2}",
                "relation": "followed_by", 
                "evidence": "Sequential text segments"
            })
    
    fallback_kg = {
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "schema": "aikg-v1", 
            "created_at": int(time.time() * 1000),
            "source": source_type,
            "method": "fallback_extraction"
        }
    }
    
    print(f"✅ Fallback KG: {len(fallback_kg['nodes'])} nodes, {len(fallback_kg['edges'])} edges")
    return fallback_kg

# --------------------- Request models ---------------------
class EmbeddingRequest(BaseModel):
    texts: List[str]
    batch_size: Optional[int] = 64
    kg_id: Optional[str] = None
    kg_prefix: Optional[str] = None

class ImageEmbeddingRequest(BaseModel):
    image_bytes: bytes
    system_prompt: Optional[str] = "You are an image analysis assistant."
    user_prompt: Optional[str] = "Provide a detailed description of this image."

class RagQueryRequest(BaseModel):
    query: str
    context_embeddings: List[List[float]]
    context_texts: List[str]
    top_k: Optional[int] = 5

class MistralTestRequest(BaseModel):
    system_prompt: Optional[str] = "You are a helpful assistant."
    user_prompt: str
    ctx_size: Optional[int] = 2048
    max_tokens: Optional[int] = 256

class RagByIdRequest(BaseModel):
    data_id: str
    query: str
    top_k: Optional[int] = 5

class MediaProcessResponse(BaseModel):
    image_or_pdf_analysis: Dict[str, Any]
    final_answer: str

# --------------------- Enhanced RAG Features (unchanged behavior) ---------------------
@app.post("/embed_and_query_advanced")
async def embed_and_query_advanced(request: Dict[str, Any]):
    """
    Advanced RAG system that:
    1. Processes images/PDFs to extract content
    2. Generates embeddings for all content
    3. Uses RAG to answer queries with memory caching
    4. Returns embeddings when requested
    """
    query_text = request.get("query", "")
    context_texts = request.get("context", [])
    image_files = request.get("images", [])  # List of base64 encoded images
    pdf_content = request.get("pdf_content", "")
    top_k = request.get("top_k", 5)
    return_embeddings = request.get("return_embeddings", False)
    
    if not query_text:
        raise HTTPException(status_code=400, detail="Query text is required")
    
    # Process images if provided
    image_descriptions = []
    image_embeddings = []
    
    if image_files:
        for i, img_b64 in enumerate(image_files):
            try:
                import base64
                image_bytes = base64.b64decode(img_b64)
                
                # Get detailed image description using Pixtral or BLIP
                if PIXTRAL_HTTP_URL:
                    pix_out = call_pixtral_http(
                        image_bytes=image_bytes, 
                        pdf_text=None, 
                        system_prompt=request.get("image_system_prompt", "You are an image analysis assistant."),
                        user_prompt=request.get("image_user_prompt", "Provide a detailed description of this image.")
                    )
                    description = pix_out.get("analysis", "") or pix_out.get("caption", "")
                else:
                    blip_out = caption_with_blip(image_bytes)
                    description = blip_out.get("caption", "")
                
                image_descriptions.append(description)
                
                # Generate embedding for the image description - use 16 cores
                embedder = lazy_load_small_embedder()
                set_torch_threads(EMBEDDING_THREADS)  # Use 16 cores for embeddings
                desc_embedding = embedder.encode([description])[0].tolist()
                image_embeddings.append(desc_embedding)
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Image processing failed: {e}")
    
    # Combine all contexts (text + image descriptions)
    all_contexts = context_texts + image_descriptions
    
    # Generate embeddings for all contexts - use 16 cores
    if all_contexts:
        embedder = lazy_load_small_embedder()
        set_torch_threads(EMBEDDING_THREADS)  # Use 16 cores for embeddings
        context_embeddings = embedder.encode(all_contexts)
        
        # Create cache key from embeddings
        cache_key = rag_cache.get_key(context_embeddings.tolist())
        
        # Check if we have cached RAG context
        cached_context = None
        if cache_key:
            cached_context = rag_cache.get(cache_key)
        
        if not cached_context:
            # Create new RAG context
            cached_context = {
                "embeddings": context_embeddings.tolist(),
                "texts": all_contexts,
                "created_at": time.time()
            }
            if cache_key:
                rag_cache.set(cache_key, cached_context)
        
        # Generate embedding for the query - use 16 cores
        set_torch_threads(EMBEDDING_THREADS)  # Use 16 cores for embeddings
        query_embedding = embedder.encode([query_text])[0].tolist()
        
        # Calculate similarities
        similarities = cosine_similarity([query_embedding], cached_context["embeddings"])[0]
        
        # Get top-k most similar contexts
        top_indices = similarities.argsort()[-top_k:][::-1]
        top_contexts = [cached_context["texts"][i] for i in top_indices]
        top_similarities = [float(similarities[i]) for i in top_indices]
        
        # Build prompt for Mistral with context - use 30 cores for Mistral
        context_str = "\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(top_contexts)])
        
        mistral_prompt = f"""
[SYSTEM]
You are a helpful AI assistant. Use the provided context to answer the user's question accurately.
If the context doesn't contain relevant information, say so.

[CONTEXT]
{context_str}

[USER]
Query: {query_text}

Please provide a detailed answer based on the context above.
"""
        
        try:
            set_torch_threads(MISTRAL_THREADS)  # Use 30 cores for Mistral
            mistral_response = run_mistral(mistral_prompt)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Mistral call failed: {e}")
        
        response = {
            "query_embedding": query_embedding,
            "similar_contexts": [
                {"text": ctx, "similarity": float(sim)} 
                for ctx, sim in zip(top_contexts, top_similarities)
            ],
            "mistral_response": mistral_response,
            "top_k": top_k,
            "total_contexts": len(all_contexts),
            "image_contexts": len(image_descriptions),
            "text_contexts": len(context_texts)
        }
        
        # Add embeddings to response if requested
        if return_embeddings:
            response["context_embeddings"] = context_embeddings.tolist()
            response["image_embeddings"] = image_embeddings
            
        return response
    else:
        # No contexts provided, just answer the query directly - use 30 cores for Mistral
        mistral_prompt = f"[SYSTEM]\nYou are a helpful assistant.\n\n[USER]\n{query_text}\n"
        try:
            set_torch_threads(MISTRAL_THREADS)  # Use 30 cores for Mistral
            mistral_response = run_mistral(mistral_prompt)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Mistral call failed: {e}")
        
        return {
            "query_embedding": [],
            "similar_contexts": [],
            "mistral_response": mistral_response,
            "top_k": top_k,
            "message": "No context provided, answering directly"
        }

@app.post("/process_image_and_embed")
async def process_image_and_embed(request: Dict[str, Any]):
    """
    Process an image and return its detailed description and embedding
    """
    image_b64 = request.get("image", "")
    system_prompt = request.get("system_prompt", "You are an image analysis assistant.")
    user_prompt = request.get("user_prompt", "Provide a detailed description of this image.")
    
    if not image_b64:
        raise HTTPException(status_code=400, detail="Image is required")
    
    try:
        import base64
        image_bytes = base64.b64decode(image_b64)
        
        # Get detailed image description - use 30 cores for image processing
        if PIXTRAL_HTTP_URL:
            pix_out = call_pixtral_http(
                image_bytes=image_bytes, 
                pdf_text=None, 
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )
            description = pix_out.get("analysis", "") or pix_out.get("caption", "")
        else:
            blip_out = caption_with_blip(image_bytes)
            description = blip_out.get("caption", "")
        
        # Generate embedding for the image description - use 16 cores
        embedder = lazy_load_small_embedder()
        set_torch_threads(EMBEDDING_THREADS)  # Use 16 cores for embeddings
        embedding = embedder.encode([description])[0].tolist()
        
        return {
            "description": description,
            "embedding": embedding,
            "embedding_length": len(embedding),
            "processing_time": time.time()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {e}")

@app.post("/rag_query")
async def rag_query(request: RagQueryRequest):
    """
    Query the RAG system with pre-computed embeddings
    """
    query = request.query
    context_embeddings = request.context_embeddings
    context_texts = request.context_texts
    top_k = request.top_k
    
    if not query or not context_embeddings or not context_texts:
        raise HTTPException(status_code=400, detail="Query, context_embeddings, and context_texts are required")
    
    if len(context_embeddings) != len(context_texts):
        raise HTTPException(status_code=400, detail="context_embeddings and context_texts must have the same length")
    
    # Create cache key from embeddings
    cache_key = rag_cache.get_key(context_embeddings)
    
    # Check if we have cached RAG context
    cached_context = None
    if cache_key:
        cached_context = rag_cache.get(cache_key)
    
    if not cached_context:
        # Create new RAG context
        cached_context = {
            "embeddings": context_embeddings,
            "texts": context_texts,
            "created_at": time.time()
        }
        if cache_key:
            rag_cache.set(cache_key, cached_context)
    
    # Generate embedding for the query - use 16 cores
    embedder = lazy_load_small_embedder()
    set_torch_threads(EMBEDDING_THREADS)  # Use 16 cores for embeddings
    query_embedding = embedder.encode([query])[0].tolist()
    
    # Calculate similarities
    similarities = cosine_similarity([query_embedding], cached_context["embeddings"])[0]
    
    # Get top-k most similar contexts
    top_indices = similarities.argsort()[-top_k:][::-1]
    top_contexts = [cached_context["texts"][i] for i in top_indices]
    top_similarities = [float(similarities[i]) for i in top_indices]
    
    # Build prompt for Mistral with context - use 30 cores for Mistral
    context_str = "\n".join([f"Context {i+1}: {ctx}" for i, ctx in enumerate(top_contexts)])
    
    mistral_prompt = f"""
[SYSTEM]
You are a helpful AI assistant. Use the provided context to answer the user's question accurately.
If the context doesn't contain relevant information, say so.

[CONTEXT]
{context_str}

[USER]
Query: {query}

Please provide a detailed answer based on the context above.
"""
    
    try:
        set_torch_threads(MISTRAL_THREADS)  # Use 30 cores for Mistral
        mistral_response = run_mistral(mistral_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mistral call failed: {e}")
    
    return {
        "query_embedding": query_embedding,
        "similar_contexts": [
            {"text": ctx, "similarity": float(sim)} 
            for ctx, sim in zip(top_contexts, top_similarities)
        ],
        "mistral_response": mistral_response,
        "top_k": top_k,
        "total_contexts": len(context_texts)
    }

# --------------------- Modified Embedding Routes: store KG and embeddings, return data_id ---------------------
def pack_embeddings_payload(texts: List[str], embeddings: List[List[float]], model_name: str) -> Dict[str, Any]:
    return {
        "model": model_name,
        "dim": len(embeddings[0]) if embeddings else 0,
        "count": len(embeddings),
        "texts": texts,
        "embeddings": embeddings,
        "created_at": int(time.time() * 1000),
    }

@app.post("/embed/small")
async def embed_small(req: EmbeddingRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail="texts required")
    set_torch_threads(EMBEDDING_THREADS)  # Use 16 cores for embeddings
    model = lazy_load_small_embedder()
    try:
        embs = model.encode(req.texts, batch_size=req.batch_size, convert_to_numpy=True, show_progress_bar=False)
        embs_list = embs.tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Generate KG with Mistral
    kg = generate_kg_from_texts(req.texts, source_type="text")
    kg_id = gen_kg_id(req.kg_id)

    # Store KG: O3 if available, otherwise MongoDB (_id will be the kg_id returned)
    if has_o3_config():
        loc = store_kg_to_o3(kg_json=kg, kg_id=kg_id, key_prefix=(req.kg_prefix or "kg/text/"))
    else:
        loc = store_kg_to_mongo(kg_json=kg, kg_id=req.kg_id)

    # Store embeddings on Lighthouse
    payload = pack_embeddings_payload(req.texts, embs_list, model_name="sentence-transformers/all-MiniLM-L6-v2")
    cid = store_embeddings_to_lighthouse(payload)

    data_id = build_data_id(cid, loc)
    return {"data_id": data_id, "kg_id": loc["kg_id"], "model": payload["model"], "count": payload["count"], "dim": payload["dim"]}

@app.post("/embed/large")
async def embed_large(req: EmbeddingRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail="texts required")
    set_torch_threads(EMBEDDING_THREADS)  # Use 16 cores for embeddings
    model = lazy_load_large_embedder()
    try:
        embs = model.encode(req.texts, batch_size=req.batch_size, convert_to_numpy=True, show_progress_bar=False)
        embs_list = embs.tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    kg = generate_kg_from_texts(req.texts, source_type="text")
    kg_id = gen_kg_id(req.kg_id)

    if has_o3_config():
        loc = store_kg_to_o3(kg_json=kg, kg_id=kg_id, key_prefix=(req.kg_prefix or "kg/text/"))
    else:
        loc = store_kg_to_mongo(kg_json=kg, kg_id=req.kg_id)

    payload = pack_embeddings_payload(req.texts, embs_list, model_name="intfloat/e5-large-v2")
    cid = store_embeddings_to_lighthouse(payload)

    data_id = build_data_id(cid, loc)
    return {"data_id": data_id, "kg_id": loc["kg_id"], "model": payload["model"], "count": payload["count"], "dim": payload["dim"]}

# --------------------- Image → data_id (max detail, no embeddings returned) ---------------------
@app.post("/image/to_data_id")
async def image_to_data_id(request: Dict[str, Any]):
    image_b64 = request.get("image", "")
    kg_id_in = request.get("kg_id")
    kg_prefix = request.get("kg_prefix", "kg/image/")
    if not image_b64:
        raise HTTPException(status_code=400, detail="Image is required")
    try:
        import base64
        image_bytes = base64.b64decode(image_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {e}")

    # Step 1: seed caption
    try:
        if PIXTRAL_HTTP_URL:
            pix_out = call_pixtral_http(
                image_bytes=image_bytes,
                pdf_text=None,
                system_prompt="You are an expert image analysis assistant.",
                user_prompt="Describe the image comprehensively including text (OCR), layout, colors, objects, actions, attributes, counts, and spatial relationships."
            )
            seed_desc = pix_out.get("analysis") or pix_out.get("caption") or ""
        else:
            seed_desc = caption_with_blip(image_bytes)["caption"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {e}")

    # Step 2: expand to maximal detail
    max_sys = (
        "You transform a seed caption into an exhaustive, highly structured, long description.\n"
        "Include: exact visible text, typography hints, colors, materials, counts, positions, layout, scene graph details, and notable fine details.\n"
        "No JSON; produce a single long descriptive paragraph optimized for downstream KG extraction."
    )
    long_prompt = f"[SYSTEM]\n{max_sys}\n\n[USER]\nSeed caption:\n{seed_desc}\n\nReturn the most detailed single paragraph description possible."
    set_torch_threads(MISTRAL_THREADS)
    long_desc = run_mistral_max(long_prompt, max_tokens=1024)

    # Step 3: embed only for storage
    embedder = lazy_load_small_embedder()
    set_torch_threads(EMBEDDING_THREADS)
    emb = embedder.encode([long_desc])[0].tolist()

    # Step 4: KG
    kg = generate_kg_from_texts([long_desc], source_type="image")
    kg_id = gen_kg_id(kg_id_in)

    # Step 5: store KG (O3 or Mongo)
    if has_o3_config():
        loc = store_kg_to_o3(kg_json=kg, kg_id=kg_id, key_prefix=kg_prefix)
    else:
        loc = store_kg_to_mongo(kg_json=kg, kg_id=kg_id_in)

    # Step 6: store embeddings on Lighthouse
    payload = pack_embeddings_payload([long_desc], [emb], model_name="sentence-transformers/all-MiniLM-L6-v2")
    cid = store_embeddings_to_lighthouse(payload)

    data_id = build_data_id(cid, loc)
    return {"data_id": data_id, "kg_id": loc["kg_id"], "model": payload["model"], "dim": payload["dim"]}

# --------------------- Smart RAG by data_id (auto-detect embedding model) ---------------------
@app.post("/rag/by_id")
async def rag_by_id(req: RagByIdRequest):
    try:
        cid, scheme, p1, p2 = parse_data_id(req.data_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid data_id: {e}")

    # Fetch embeddings(+texts) from Lighthouse
    try:
        emb_payload = fetch_json_from_lighthouse_cid(cid)
        texts = emb_payload.get("texts", [])
        embeddings = emb_payload.get("embeddings", [])
        stored_model = emb_payload.get("model", "")
        stored_dim = emb_payload.get("dim", 0)
        
        if not texts or not embeddings or len(texts) != len(embeddings):
            raise RuntimeError("Invalid embedding payload from Lighthouse")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed fetching embeddings: {e}")

    # Fetch KG
    try:
        if scheme == "o3":
            bucket, key = p1, p2
            s3 = get_o3_client()
            obj = s3.get_object(Bucket=bucket, Key=key)
            kg = json.loads(obj["Body"].read())
        elif scheme == "mongo":
            collection, kg_id = p1, p2
            kg = fetch_kg_from_mongo(collection, kg_id)
        else:
            raise RuntimeError("Unknown KG scheme")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed fetching KG: {e}")

    # 🧠 SMART MODEL SELECTION: Use the same model that was used for storage
    set_torch_threads(EMBEDDING_THREADS)
    
    # Auto-detect which embedding model to use based on stored model info
    if "large" in stored_model.lower() or stored_dim >= 1000:
        # Use large model for 1024D embeddings
        embedder = lazy_load_large_embedder()
        print(f"Using LARGE embedder for {stored_dim}D embeddings from {stored_model}")
    else:
        # Use small model for 384D embeddings  
        embedder = lazy_load_small_embedder()
        print(f"Using SMALL embedder for {stored_dim}D embeddings from {stored_model}")
    
    # Generate query embedding with matching model
    q_emb = embedder.encode([req.query])[0].tolist()
    
    # Verify dimensions match
    query_dim = len(q_emb)
    if query_dim != stored_dim:
        raise HTTPException(
            status_code=400, 
            detail=f"Dimension mismatch: query={query_dim}D, stored={stored_dim}D, model={stored_model}"
        )
    
    # RAG retrieval
    sims = cosine_similarity([q_emb], embeddings)[0]
    top_indices = sims.argsort()[-req.top_k :][::-1]
    top_contexts = [texts[i] for i in top_indices]
    top_scores = [float(sims[i]) for i in top_indices]

    # Add KG triples
    kg_edges = kg.get("edges", []) if isinstance(kg, dict) else []
    triples = []
    for e in kg_edges[:256]:
        src = e.get("source", "")
        rel = e.get("relation", "")
        tgt = e.get("target", "")
        triples.append(f"{src} -{rel}-> {tgt}")
    triples_block = "\n".join(triples)
    context_block = "\n".join([f"Context {i+1}: {c}" for i, c in enumerate(top_contexts)])
    full_context = context_block + ("\n\nKG Triples:\n" + triples_block if triples_block else "")

    mistral_prompt = f"""
[SYSTEM]
You are a precise RAG assistant. Use provided contexts and KG triples. If uncertain, say so. Prefer verbatim facts from contexts.

[CONTEXTS_AND_KG]
{full_context}

[USER]
Query: {req.query}

[INSTRUCTIONS]
Answer comprehensively with citations to 'Context i' where applicable and avoid speculation.
"""
    set_torch_threads(MISTRAL_THREADS)
    out = run_mistral_max(mistral_prompt, max_tokens=1024)
    return {
        "answer": out,
        "similar_contexts": [{"index": int(i), "similarity": s} for i, s in zip(top_indices.tolist(), top_scores)],
        "used_kg_edges": min(len(kg_edges), 256),
        "model_info": f"Used {stored_model} ({stored_dim}D) for query embedding"
    }

# --------------------- Download Route ---------------------
@app.get("/download/by_id/{data_id}")
async def download_by_id(data_id: str, format: str = "json"):
    """
    Download both embeddings and knowledge graph data
    
    Formats supported:
    - json: Combined JSON response
    - embeddings: Only embeddings data
    - kg: Only knowledge graph data
    """
    try:
        cid, scheme, p1, p2 = parse_data_id(data_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid data_id: {e}")

    # Fetch embeddings from Lighthouse
    try:
        emb_payload = fetch_json_from_lighthouse_cid(cid)
    except Exception as e:
        if format == "kg":
            emb_payload = {"error": "Could not fetch embeddings"}
        else:
            raise HTTPException(status_code=500, detail=f"Failed fetching embeddings: {e}")

    # Fetch KG
    try:
        if scheme == "o3":
            bucket, key = p1, p2
            s3 = get_o3_client()
            obj = s3.get_object(Bucket=bucket, Key=key)
            kg = json.loads(obj["Body"].read())
        elif scheme == "mongo":
            collection, kg_id = p1, p2
            kg = fetch_kg_from_mongo(collection, kg_id)
        else:
            raise RuntimeError("Unknown KG scheme")
    except Exception as e:
        if format == "embeddings":
            kg = {"error": "Could not fetch knowledge graph"}
        else:
            raise HTTPException(status_code=500, detail=f"Failed fetching KG: {e}")

    # Return based on format
    if format == "embeddings":
        return emb_payload
    elif format == "kg":
        return kg
    else:  # json (default)
        return {
            "data_id": data_id,
            "embeddings": emb_payload,
            "knowledge_graph": kg,
            "download_time": int(time.time() * 1000)
        }

# --------------------- Original Routes (kept) ---------------------
@app.post("/test/mistral")
async def test_mistral(req: MistralTestRequest):
    set_torch_threads(MISTRAL_THREADS)  # Use 30 cores for Mistral
    prompt = f"[SYSTEM]\n{req.system_prompt}\n\n[USER]\n{req.user_prompt}\n"
    try:
        out = run_mistral_llama_cpp(prompt, threads=MISTRAL_THREADS, max_tokens=req.max_tokens or 256)
        return {"output": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process/media", response_model=MediaProcessResponse)
async def process_media(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    system_prompt: Optional[str] = Form(None),
    user_prompt: Optional[str] = Form(None),
):
    set_torch_threads(MISTRAL_THREADS)  # Use 30 cores for image processing

    if file is None and not url:
        raise HTTPException(status_code=400, detail="Either a file upload or url must be provided.")

    content_bytes = None
    filename = None
    
    if url:
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
            content_bytes = r.content
            filename = url.split("/")[-1]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch url: {e}")

    if file:
        content_bytes = await file.read()
        filename = file.filename or filename

    is_pdf = False
    is_image = False
    if filename and filename.lower().endswith(".pdf"):
        is_pdf = True
    else:
        try:
            Image.open(io.BytesIO(content_bytes))
            is_image = True
        except Exception:
            pass

    image_or_pdf_analysis = {}

    pdf_text = None
    if is_pdf:
        try:
            pdf_text = extract_text_from_pdf_bytes(content_bytes)
            image_or_pdf_analysis["pdf_text_snippet"] = pdf_text[:4000]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF processing failed: {e}")

    if is_image:
        try:
            if PIXTRAL_HTTP_URL:
                pix_out = call_pixtral_http(content_bytes, None, system_prompt or "", user_prompt or "")
                image_or_pdf_analysis.update(pix_out)
            else:
                blip_out = caption_with_blip(content_bytes)
                image_or_pdf_analysis.update(blip_out)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image processing failed: {e}")

    system_prompt = system_prompt or "You are a helpful assistant. Use the analysis provided to answer the user's question." 
    user_prompt = user_prompt or "Please answer based on the provided media."

    analysis_block = json.dumps(image_or_pdf_analysis, indent=2)
    if pdf_text:
        analysis_block = f"PDF extracted text (truncated):\n{pdf_text[:8000]}\n\n" + analysis_block

    final_prompt = (
        f"[SYSTEM]\n{system_prompt}\n\n"
        f"[MEDIA_ANALYSIS]\n{analysis_block}\n\n"
        f"[USER]\n{user_prompt}\n\n"
        f"[INSTRUCTIONS]\nUse the media analysis above and answer the user's request clearly."
    )

    try:
        set_torch_threads(MISTRAL_THREADS)  # Use 30 cores for Mistral
        mistral_out = run_mistral(final_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mistral call failed: {e}")

    return MediaProcessResponse(image_or_pdf_analysis=image_or_pdf_analysis, final_answer=mistral_out)

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "mistral_threads": MISTRAL_THREADS,
        "embedding_threads": EMBEDDING_THREADS,
        "o3_enabled": has_o3_config(),
        "o3_bucket": AKAVE_O3_BUCKET if has_o3_config() else None,
        "mongo_uri_set": bool(MONGODB_URI),
        "mongo_db": MONGODB_DB if MONGODB_URI else None,
        "lighthouse_token_set": bool(LIGHTHOUSE_TOKEN),
        "lighthouse_sdk_only": True,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
