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
