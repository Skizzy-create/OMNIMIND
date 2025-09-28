# OMNIMIND: Decentralized AI Knowledge Infrastructure

> **The Missing Knowledge Layer for Web3 AI Agents**

OMNIMIND is a decentralized AI data and compute layer that transforms unstructured data into intelligent, queryable knowledge graphs. Built for the Web3 ecosystem, it provides the foundational infrastructure that makes AI agents truly intelligent without expensive fine-tuning.

## 🎯 Vision

We're building the **Chainlink of AI Knowledge** - a universal infrastructure layer that enables 1M+ Web3 AI agents to access domain-specific intelligence through a decentralized, pay-per-query model.

## 🚀 What We Do

OMNIMIND solves the critical knowledge gap in Web3 AI by providing:

- **Multi-modal Data Processing**: Upload PDFs, images, videos, and audio files
- **Intelligent Knowledge Extraction**: Automatic generation of knowledge graphs and embeddings
- **Decentralized Storage**: Distributed across Walrus, Akave O3, and Filecoin
- **Smart Retrieval**: RAG (Retrieval-Augmented Generation) with semantic search
- **Pay-Per-Query Economics**: Sustainable model that benefits data providers and consumers

## 🏗️ Architecture

### Storage Layer
- **Walrus**: Erasure-coded blob storage for raw data
- **Akave O3**: S3-compatible storage for processed embeddings
- **Filecoin (via Synapse SDK)**: Warm storage for knowledge graphs and metadata
- **Lighthouse**: IPFS-based storage with client-side encryption

### Compute Layer
- **Fluence**: Decentralized compute for embedding generation
- **Local Processing**: Mistral 7B for knowledge graph extraction
- **Multi-modal Models**: BLIP for image captioning, Pixtral for advanced image analysis

### API Layer
- **FastAPI Server**: High-performance Python backend
- **RESTful Endpoints**: Easy integration for developers
- **Data ID System**: Universal addressing for stored knowledge

## 📊 Technical Specifications

### Supported Models
- **Text Embeddings**:
  - Small: `sentence-transformers/all-MiniLM-L6-v2` (384D)
  - Large: `intfloat/e5-large-v2` (1024D)
- **Language Model**: Mistral 7B Instruct (GGUF format)
- **Image Processing**: BLIP-2, Pixtral (via HTTP)

### Performance Optimizations
- **Threading**: 30 cores for Mistral/image processing, 16 cores for embeddings
- **Caching**: 30-second RAG cache for repeated queries
- **Batch Processing**: Configurable batch sizes for embeddings
- **Smart Model Selection**: Automatic model matching for queries

## 🔧 Installation & Setup

### Prerequisites
- Python 3.8+
- CUDA-compatible GPU (recommended)
- 32GB+ RAM for optimal performance

### Environment Variables
```bash
# Core Models
LLAMA_CPP_BIN=./llama_cpp/build/bin/llama-cli
MISTRAL_GGUF=./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf

# Threading Configuration
MISTRAL_THREADS=30
EMBEDDING_THREADS=16

# Storage Configuration
AKAVE_O3_ENDPOINT=your_akave_endpoint
AKAVE_O3_ACCESS_KEY_ID=your_access_key
AKAVE_O3_SECRET_ACCESS_KEY=your_secret_key
AKAVE_O3_BUCKET=aikg

# Database Fallback
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=aikg
MONGODB_COLLECTION=knowledge_graphs

# Lighthouse Storage
LIGHTHOUSE_TOKEN=your_lighthouse_token

# Optional HTTP Services
PIXTRAL_HTTP_URL=http://your-pixtral-service
OLLAMA_HTTP_URL=http://your-ollama-service
```

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/OMNIMIND.git
cd OMNIMIND

# Install Python dependencies
cd PythonServer
pip install -r requirements.txt

# Download models (example)
mkdir -p models
wget https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -O models/mistral-7b-instruct-v0.2.Q4_K_M.gguf

# Start the server
python server.py
```

## 📡 API Endpoints

### Core Workflow

#### 1. Store Data & Generate Knowledge
```bash
# Text to embeddings + knowledge graph
POST /embed/small
{
  "texts": ["Your text content here"],
  "batch_size": 64,
  "kg_prefix": "kg/text/"
}
# Returns: {"data_id": "CID::storage_type:location"}

# Image to knowledge graph
POST /image/to_data_id
{
  "image": "base64_encoded_image",
  "kg_prefix": "kg/image/"
}
# Returns: {"data_id": "CID::storage_type:location"}
```

#### 2. Query Knowledge
```bash
# RAG query by data_id
POST /rag/by_id
{
  "data_id": "your_data_id_from_step_1",
  "query": "What does this data contain?",
  "top_k": 5
}
# Returns: Intelligent answer with context and citations
```

### Advanced Features

#### Multi-modal Processing
```bash
POST /embed_and_query_advanced
{
  "query": "Analyze this content",
  "context": ["text content"],
  "images": ["base64_image"],
  "top_k": 3
}
```

#### Media Processing
```bash
POST /process/media
# Form data with file upload or URL
# Supports: Images, PDFs, with custom prompts
```

### Diagnostics
```bash
GET /health
# System status and configuration

POST /test/mistral
{
  "system_prompt": "You are a helpful assistant",
  "user_prompt": "Say hello",
  "max_tokens": 128
}
```

## 🔄 Data Flow

1. **Upload**: Raw data (PDF, image, text) uploaded to system
2. **Process**: Content extracted and analyzed using AI models
3. **Extract**: Knowledge graphs generated using Mistral 7B
4. **Embed**: Text converted to vector embeddings
5. **Store**:
   - Raw data → Walrus (erasure-coded)
   - Embeddings → Lighthouse (IPFS)
   - Knowledge graphs → Akave O3 or MongoDB
6. **Query**: RAG system retrieves relevant context and generates answers
7. **Return**: Intelligent responses with citations and confidence scores

## 💾 Data ID System

OMNIMIND uses a universal addressing system:

```
Format: <EMBEDDING_CID>::<STORAGE_TYPE>:<LOCATION>

Examples:
- QmXXX::o3:aikg/kg/text/abc123.json
- QmYYY::mongo:knowledge_graphs/507f1f77bcf86cd799439011
```

This enables:
- **Verifiable Storage**: Content-addressed embeddings
- **Flexible Backends**: O3, MongoDB, or custom storage
- **Universal Access**: Same API regardless of storage location

## 🧠 Knowledge Graph Schema

```json
{
  "nodes": [
    {
      "id": "concept_1",
      "type": "concept",
      "label": "Machine Learning"
    }
  ],
  "edges": [
    {
      "source": "concept_1",
      "target": "concept_2",
      "relation": "relates_to",
      "evidence": "Supporting text from source"
    }
  ],
  "metadata": {
    "schema": "aikg-v1",
    "created_at": 1640995200000,
    "source": "text|image|pdf",
    "method": "mistral|fallback_extraction"
  }
}
```

## 🎯 Use Cases

### For AI Agent Developers
- **Domain Intelligence**: Give agents expertise in DeFi, governance, trading
- **Multi-modal Understanding**: Process documents, images, and data together
- **Cost Efficiency**: Pay-per-query vs expensive fine-tuning
- **Rapid Integration**: RESTful API with comprehensive documentation

### For Data Providers
- **Monetization**: Earn from knowledge contributions
- **Decentralized Storage**: Censorship-resistant and verifiable
- **Automatic Processing**: AI handles knowledge extraction
- **Global Access**: Serve the entire Web3 AI ecosystem

### For Enterprises
- **Private Knowledge Networks**: Sensitive data with encryption
- **Scalable Infrastructure**: Handles millions of queries
- **Chain-Agnostic**: Works across Ethereum, Solana, Polygon, etc.
- **White-Label Solutions**: Custom deployments available

## 🔒 Security & Privacy

- **Client-Side Encryption**: Lighthouse integration for sensitive data
- **Decentralized Storage**: No single point of failure
- **Verifiable Retrieval**: Content-addressed storage ensures integrity
- **Access Control**: Wallet-based authentication (planned)

## 🚀 Roadmap

### Phase 1: Foundation (Current)
- ✅ Multi-modal processing pipeline
- ✅ Knowledge graph generation
- ✅ Decentralized storage integration
- ✅ RAG query system
- ✅ API documentation and testing

### Phase 2: Scale (Q1 2025)
- 🔄 Wallet authentication
- 🔄 Pay-per-query economics
- 🔄 Cross-chain deployment
- 🔄 Enterprise partnerships

### Phase 3: Ecosystem (Q2-Q3 2025)
- 📋 AI agent marketplace integration
- 📋 Advanced analytics dashboard
- 📋 Community governance
- 📋 Developer SDK and tools

## 🤝 Contributing

We welcome contributions from the community! Please see our contributing guidelines and join our developer community.

### Development Setup
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# Format code
black server.py
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌐 Links

- **Website**: [Coming Soon]
- **Documentation**: [API Docs](./docs/)
- **Twitter**: [@OMNIMIND](https://twitter.com/OMNIMIND)
- **Discord**: [Join Community](https://discord./OMNIMIND)

## 🙏 Acknowledgments

Built with love for the Web3 AI community. Special thanks to:
- Walrus team for erasure-coded storage
- Akave for S3-compatible decentralized storage
- Lighthouse for IPFS integration
- Filecoin ecosystem for warm storage solutions
- Open source AI/ML community

---

**OMNIMIND: Making Web3 AI Agents Intelligent** 🧠⚡
