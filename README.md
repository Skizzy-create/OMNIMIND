<<<<<<< HEAD
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
=======
# OmniMind

Web3's Universal Knowledge Infrastructure Layer - A modern React frontend for uploading files to Walrus decentralized storage with drag & drop functionality, progress tracking, and comprehensive file management.

## Features

- **Pitch Deck Presentation**: Interactive presentation with 5 key slides covering the OmniMind vision
- **Drag & Drop File Upload**: Intuitive file upload with visual feedback
- **Walrus Integration**: Complete integration with Walrus decentralized storage
- **Progress Tracking**: Real-time upload progress through all phases
- **File Management**: View uploaded files with direct download links
- **Responsive Design**: Modern UI that works on all devices
- **Error Handling**: Comprehensive error handling and user feedback

## Project Structure

```
omnimind/
├── src/
│   ├── components/
│   │   ├── FileUploader.tsx    # Main upload component
│   │   ├── PresentationApp.tsx # Pitch deck presentation
│   │   └── slides/             # Presentation slides
│   ├── services/
│   │   └── walrusService.ts    # Walrus SDK integration
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # Component styles
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles
├── public/
│   ├── walrus_bg.wasm          # Walrus WASM file (download separately)
│   └── vite.svg                # Vite logo
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── env.example                 # Environment template
└── README.md                   # This file
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Download Walrus WASM File

Download the `walrus_bg.wasm` file from [Walrus releases](https://github.com/mystenlabs/walrus/releases) and place it in the `public/` directory.

### 3. Configure Environment (Optional)

Copy the environment template:

```bash
cp env.example .env
```

The default testnet configuration is already set up, but you can customize it in `.env`.

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

## Walrus Integration

### Upload Process

The upload process follows Walrus's multi-phase approach:

1. **Encoding**: File is encoded for fault tolerance
2. **Registering**: Blob is registered on-chain
3. **Uploading**: Data is uploaded to storage nodes
4. **Certifying**: Upload is certified on-chain

### Key Features

- **Automatic Keypair Generation**: Creates a new Ed25519 keypair for each session
- **Progress Tracking**: Real-time progress updates for each phase
- **Error Recovery**: Comprehensive error handling with user-friendly messages
- **File Validation**: Client-side file validation before upload

## Configuration

### Environment Variables

```env
VITE_SUI_TESTNET_RPC=https://fullnode.testnet.sui.io:443
VITE_WALRUS_AGGREGATOR=https://aggregator.testnet.walrus.space
VITE_WALRUS_PUBLISHER=https://publisher.testnet.walrus.space
```

### Walrus Settings

- **Storage Duration**: 5 epochs (configurable in `walrusService.ts`)
- **Deletable**: false (files cannot be deleted once uploaded)
- **Testnet**: Currently configured for Walrus testnet

## Usage

### Uploading Files

1. **Drag & Drop**: Drag files directly onto the upload area
2. **Click to Upload**: Click the upload area to select files
3. **File Selection**: Choose any file type up to 500MB
4. **Upload**: Click "Upload to Walrus" to start the process

### Managing Uploads

- **Progress Tracking**: Watch real-time progress through all phases
- **Download Links**: Access uploaded files via direct URLs
- **Blob IDs**: Copy blob IDs for programmatic access
- **Upload History**: View all successfully uploaded files

## Technical Details

### Walrus Service

The `WalrusService` class handles all interactions with Walrus:

```typescript
class WalrusService {
  // Upload file with progress tracking
  async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<WalrusFile>
  
  // Read file from Walrus
  async readFile(blobId: string): Promise<Uint8Array>
  
  // Get file URL for display
  getFileUrl(blobId: string): string
}
```

### File Upload Flow

```typescript
interface UploadProgress {
  phase: 'encoding' | 'registering' | 'uploading' | 'certifying' | 'complete';
  progress: number;
  message: string;
}
```

### Walrus File Structure

```typescript
interface WalrusFile {
  blobId: string;      // Unique blob identifier
  name: string;        // Original filename
  size: number;        // File size in bytes
  type: string;        // MIME type
  uploadedAt: Date;    // Upload timestamp
  url?: string;        // Direct access URL
}
```

## Troubleshooting

### Common Issues

1. **WASM File Missing**: Ensure `walrus_bg.wasm` is in the `public/` directory
2. **Network Errors**: Check your internet connection and testnet status
3. **Upload Failures**: Verify file size is under 500MB
4. **Keypair Issues**: The app generates a new keypair for each session

### Debug Mode

Enable browser developer tools to see detailed logs:

```javascript
// In browser console
localStorage.setItem('debug', 'walrus:*');
```

## Security Considerations

- **Keypair Management**: Currently generates temporary keypairs (implement wallet integration for production)
- **File Validation**: All files are validated before upload
- **Network Security**: Uses HTTPS for all network requests
- **Data Privacy**: Files are stored on decentralized network

## Development

### Adding Features

1. **New Upload Sources**: Extend `WalrusService` with additional upload methods
2. **Custom Validation**: Add file type/size validation in `FileUploader`
3. **Progress Enhancements**: Customize progress tracking in upload flow
4. **UI Improvements**: Modify components in `src/components/`

### Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build verification
npm run build
```

## Production Deployment

### Vercel

```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify

```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Self-Hosted

```bash
npm run build
# Serve dist/ folder with any static file server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## About Walrus

Walrus is a decentralized storage protocol that provides:
- **High Availability**: Files are distributed across multiple nodes
- **Fault Tolerance**: Erasure coding ensures data integrity
- **Cryptographic Proofs**: zkTLS proofs verify data authenticity
- **Sui Integration**: Native integration with Sui blockchain

For more information, visit [Walrus Documentation](https://docs.walrus.xyz/).
>>>>>>> jay
