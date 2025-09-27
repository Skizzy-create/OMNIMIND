import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';

// Type definitions
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  message?: string;
  progress?: number;
  phase?: string;
}

export interface WalrusFile {
  id: string;
  name: string;
  size: number;
  type: string;
  blobId?: string;
  uploadTime: Date;
  uploadedAt?: Date;
  url?: string;
}

// Walrus Service class
export class WalrusService {
  private client: WalrusClient;

  constructor() {
    this.client = walrusClient;
    console.log('🔧 WalrusService initialized with client:', this.client);
  }

  static createWithKeypair() {
    console.log('🔑 Creating WalrusService with keypair...');
    return new WalrusService();
  }

  async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<WalrusFile> {
    console.log('📤 Starting file upload:', file.name);
    
    // Simulate upload progress for now
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => {
          onProgress({
            loaded: (file.size * i) / 100,
            total: file.size,
            percentage: i
          });
        }, i * 50);
      }
    }

    // For now, return a mock file object
    // TODO: Implement actual Walrus upload
    return new Promise((resolve) => {
      setTimeout(() => {
        const walrusFile: WalrusFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          blobId: `blob_${Math.random().toString(36).substr(2, 9)}`,
          uploadTime: new Date(),
          uploadedAt: new Date(),
          url: `https://walrus.testnet.blob/${Math.random().toString(36).substr(2, 9)}`
        };
        console.log('✅ File upload completed:', walrusFile);
        resolve(walrusFile);
      }, 1000);
    });
  }

  async downloadFile(blobId: string): Promise<Blob> {
    console.log('📥 Downloading file with blob ID:', blobId);
    // TODO: Implement actual Walrus download
    throw new Error('Download not implemented yet');
  }

  async getFile(blobId: string): Promise<WalrusFile | null> {
    console.log('🔍 Getting file with blob ID:', blobId);
    // TODO: Implement actual Walrus file retrieval
    return null;
  }

  async downloadFileByBlobId(blobId: string): Promise<Blob> {
    console.log('📥 Downloading file with blob ID:', blobId);
    // TODO: Implement actual Walrus download
    throw new Error('Download not implemented yet');
  }
}

// Create Sui client instance
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

console.log('✅ SuiClient created successfully:', {
  url: getFullnodeUrl('testnet'),
  client: suiClient
});

// Create Walrus client instance
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient: suiClient as any, // Type assertion to resolve version compatibility
});

console.log('✅ WalrusClient created successfully:', {
  network: 'testnet',
  client: walrusClient
});

// Test the connection
console.log('🔍 Testing Walrus service connection...');

// Export the clients for use in other parts of the application
export { suiClient, walrusClient };

// Optional: Create a custom configured walrus client with manual package config
export const createCustomWalrusClient = (packageConfig: {
  systemObjectId: string;
  stakingPoolId: string;
}) => {
  return new WalrusClient({
    suiClient: suiClient as any, // Type assertion to resolve version compatibility
    packageConfig,
  });
};

// Optional: Create a walrus client with custom storage node options
export const createWalrusClientWithCustomFetch = (customFetchOptions?: {
  timeout?: number;
  fetch?: typeof fetch;
}) => {
  return new WalrusClient({
    network: 'testnet',
    suiClient: suiClient as any, // Type assertion to resolve version compatibility
    storageNodeClientOptions: {
      fetch: customFetchOptions?.fetch || ((url, options) => {
        console.log('fetching', url);
        return fetch(url, options);
      }),
      timeout: customFetchOptions?.timeout || 60_000,
    },
  });
};
