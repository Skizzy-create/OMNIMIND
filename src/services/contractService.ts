import { ethers } from 'ethers';

// Contract addresses from Local Anvil deployment (Chain ID: 314)
// Note: Filecoin Calibration deployment failed due to gas limit issues
const CONTRACT_ADDRESSES = {
  DataRegistry: '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
  DataNFT: '0x9A676e781A523b5d0C0e43731313A708CB607508',
  DataCoin: '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82',
  DummyVerifier: '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
  AccessManager: '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1'
};

// DataRegistry ABI (simplified for our use case)
const DATA_REGISTRY_ABI = [
  "function registerDataset(string memory _name, string memory _fileHash) external",
  "function verifyDataset(uint256 _id) external",
  "function datasetCount() external view returns (uint256)",
  "function datasets(uint256) external view returns (uint256 id, string memory name, string memory fileHash, address owner, bool verified, address nftAddress)",
  "event DatasetRegistered(uint256 indexed id, address indexed owner, string name)",
  "event DatasetVerified(uint256 indexed id, bool verified)"
];

export interface ContractDataset {
  id: number;
  name: string;
  fileHash: string;
  owner: string;
  verified: boolean;
  nftAddress: string;
}

export interface UploadData {
  blobId: string;
  dataId: string;
  datasetHash: string;
  fileName: string;
  fileSize: number;
  processingType: 'fast' | 'slow';
}

export class ContractService {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;
  private dataRegistry: ethers.Contract;

  constructor(rpcUrl: string = 'http://localhost:8545') {
    // For Filecoin Calibration: https://api.calibration.node.glif.io/rpc/v1
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.dataRegistry = new ethers.Contract(
      CONTRACT_ADDRESSES.DataRegistry,
      DATA_REGISTRY_ABI,
      this.provider
    );
  }

  /**
   * Connect wallet to the contract service
   */
  async connectWallet(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = await this.provider.getSigner();
        this.dataRegistry = this.dataRegistry.connect(this.signer);
        console.log('✅ Wallet connected to contract service');
      } catch (error) {
        console.error('❌ Failed to connect wallet:', error);
        throw new Error('Failed to connect wallet');
      }
    } else {
      throw new Error('MetaMask not found');
    }
  }

  /**
   * Register dataset in the contract
   */
  async registerDataset(uploadData: UploadData): Promise<number> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('📝 Registering dataset in contract...');
      
      // Create a comprehensive file hash that includes all relevant data
      const comprehensiveHash = ethers.keccak256(
        ethers.toUtf8Bytes(
          JSON.stringify({
            blobId: uploadData.blobId,
            dataId: uploadData.dataId,
            datasetHash: uploadData.datasetHash,
            fileName: uploadData.fileName,
            fileSize: uploadData.fileSize,
            processingType: uploadData.processingType,
            timestamp: Date.now()
          })
        )
      );

      // Create dataset name with processing type
      const datasetName = `${uploadData.fileName} (${uploadData.processingType})`;

      // Register the dataset
      const tx = await this.dataRegistry.registerDataset(
        datasetName,
        comprehensiveHash
      );

      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Dataset registered successfully!');
      console.log('Transaction hash:', receipt.hash);

      // Get the dataset ID from the event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.dataRegistry.interface.parseLog(log);
          return parsed?.name === 'DatasetRegistered';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.dataRegistry.interface.parseLog(event);
        const datasetId = parsed?.args.id;
        console.log('📊 Dataset ID:', datasetId.toString());
        return Number(datasetId);
      }

      // Fallback: get the current dataset count
      const datasetCount = await this.dataRegistry.datasetCount();
      return Number(datasetCount);

    } catch (error) {
      console.error('❌ Failed to register dataset:', error);
      throw new Error(`Contract registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify dataset in the contract
   */
  async verifyDataset(datasetId: number): Promise<void> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log(`🔍 Verifying dataset ${datasetId}...`);
      
      const tx = await this.dataRegistry.verifyDataset(datasetId);
      const receipt = await tx.wait();
      
      console.log('✅ Dataset verified successfully!');
      console.log('Transaction hash:', receipt.hash);
    } catch (error) {
      console.error('❌ Failed to verify dataset:', error);
      throw new Error(`Dataset verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get dataset information
   */
  async getDataset(datasetId: number): Promise<ContractDataset> {
    try {
      const dataset = await this.dataRegistry.datasets(datasetId);
      return {
        id: Number(dataset.id),
        name: dataset.name,
        fileHash: dataset.fileHash,
        owner: dataset.owner,
        verified: dataset.verified,
        nftAddress: dataset.nftAddress
      };
    } catch (error) {
      console.error('❌ Failed to get dataset:', error);
      throw new Error(`Failed to get dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get total dataset count
   */
  async getDatasetCount(): Promise<number> {
    try {
      const count = await this.dataRegistry.datasetCount();
      return Number(count);
    } catch (error) {
      console.error('❌ Failed to get dataset count:', error);
      throw new Error(`Failed to get dataset count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.signer !== null;
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }
}
