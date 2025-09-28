import { ethers } from 'ethers';

// Contract addresses from Base Sepolia deployment (Chain ID: 84532)
const CONTRACT_ADDRESSES = {
  DataRegistry: '0xfe45982a5AFd035790Cbc375E77516d0e76121cC',
  DataNFT: '0x3E3D844F7E7A4A75EA9E94794B92675a78c7bb38',
  DataCoin: '0x75Feae36284D8cf3Ca071203f3F99cA5f7DD5220',
  DummyVerifier: '0xD1F9F3A46Ab621223018BcCbbDC0bf4BfC1f142e',
  AccessManager: '0x680b617F83741c77968782303b8419939ed16Ff8'
};

// DataRegistry ABI (simplified for our use case)
const DATA_REGISTRY_ABI = [
  "function registerDataset(string memory _name, string memory _fileHash) external",
  "function verifyDataset(uint256 _id) external",
  "function datasetCount() external view returns (uint256)",
  "function datasets(uint256) external view returns (uint256 id, string memory name, string memory fileHash, address owner, bool verified, address nftAddress)",
  "event DatasetRegistered(uint256 indexed id, address indexed owner, string name)",
  "event DatasetVerified(uint256 indexed id, bool verified)",
  "event DatasetRewarded(uint256 indexed id, address indexed owner, uint256 amount)"
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

  constructor(rpcUrl: string = 'https://sepolia.base.org') {
    // For Base Sepolia: https://sepolia.base.org
    console.log('🔧 Initializing ContractService with RPC:', rpcUrl);
    console.log('📋 Contract Address:', CONTRACT_ADDRESSES.DataRegistry);
    
    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.dataRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.DataRegistry,
        DATA_REGISTRY_ABI,
        this.provider
      );
      console.log('✅ ContractService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ContractService:', error);
      throw error;
    }
  }

  /**
   * Connect wallet to the contract service
   */
  async connectWallet(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.signer = await (this.provider as any).getSigner();
        this.dataRegistry = this.dataRegistry.connect(this.signer) as ethers.Contract;
        console.log('✅ Wallet connected to contract service');
        console.log('📋 Contract Address:', CONTRACT_ADDRESSES.DataRegistry);
        console.log('🔗 RPC URL:', 'wss://base-sepolia.drpc.org');
        console.log('🌐 Network Chain ID:', 84532);
      } catch (error) {
        console.error('❌ Failed to connect wallet:', error);
        console.log('📋 Contract Address:', CONTRACT_ADDRESSES.DataRegistry);
        throw new Error('Failed to connect wallet');
      }
    } else {
      console.error('❌ MetaMask not found');
      console.log('📋 Contract Address:', CONTRACT_ADDRESSES.DataRegistry);
      throw new Error('MetaMask not found');
    }
  }

  /**
   * Register dataset in the contract
   */
  async registerDataset(uploadData: UploadData): Promise<number> {
    if (!this.signer) {
      console.error('❌ Wallet not connected - signer is null');
      console.log('📋 Contract Address:', CONTRACT_ADDRESSES.DataRegistry);
      throw new Error('Wallet not connected');
    }

    try {
      console.log('📝 Registering dataset in contract...');
      console.log('📋 Contract Address:', CONTRACT_ADDRESSES.DataRegistry);
      console.log('🔗 Connected to network:', await this.provider.getNetwork());
      console.log('💰 Signer address:', await this.signer.getAddress());
      console.log('💳 Signer balance:', ethers.formatEther(await this.signer.provider!.getBalance(await this.signer.getAddress())));
      
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

      console.log('📊 Dataset name:', datasetName);
      console.log('🔐 File hash:', comprehensiveHash);

      // Register the dataset with timeout
      console.log('📝 Calling registerDataset function...');
      const tx = await this.dataRegistry.registerDataset(
        datasetName,
        comprehensiveHash
      );

      console.log('⏳ Transaction sent, waiting for confirmation...');
      console.log('📋 Transaction hash:', tx.hash);
      
      // Wait for transaction with timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000)
        )
      ]);
      
      console.log('✅ Dataset registered successfully!');
      console.log('📋 Transaction receipt:', receipt);

      // Get the dataset ID from the event
      const event = receipt.logs.find((log: any) => {
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
      console.log('📋 Contract Address:', CONTRACT_ADDRESSES.DataRegistry);
      console.log('🔗 RPC URL:', 'wss://base-sepolia.drpc.org');
      console.log('🌐 Expected Network:', 'Base Sepolia (Chain ID: 84532)');
      
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
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
   * Listen for DatasetRegistered events
   */
  async listenForDatasetEvents(
    callback: (event: any) => void,
    fromBlock: number = -10000
  ): Promise<void> {
    try {
      console.log('👂 Starting to listen for DatasetRegistered events...');
      
      const filter = this.dataRegistry.filters.DatasetRegistered();
      
      // Listen for new events
      this.dataRegistry.on(filter, callback);
      
      // Also get historical events (last 10,000 blocks to avoid RPC limits)
      const historicalEvents = await this.dataRegistry.queryFilter(filter, fromBlock);
      console.log(`📚 Found ${historicalEvents.length} historical events`);
      
      // Process historical events
      historicalEvents.forEach(event => {
        callback(event);
      });
      
    } catch (error) {
      console.error('❌ Failed to listen for events:', error);
      throw new Error(`Event listening failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop listening for events
   */
  stopListeningForEvents(): void {
    try {
      this.dataRegistry.removeAllListeners();
      console.log('🔇 Stopped listening for events');
    } catch (error) {
      console.error('❌ Failed to stop listening:', error);
    }
  }

  /**
   * Get all datasets from events
   */
  async getAllDatasetsFromEvents(fromBlock: number = -10000): Promise<ContractDataset[]> {
    try {
      console.log('📊 Fetching all datasets from events...');
      
      const filter = this.dataRegistry.filters.DatasetRegistered();
      
      // Use a more recent block to avoid the 10,000 block limit
      // -10000 means "last 10,000 blocks from current"
      const events = await this.dataRegistry.queryFilter(filter, fromBlock);
      
      const datasets: ContractDataset[] = [];
      
      for (const event of events) {
        if ('args' in event && event.args) {
          const datasetId = Number(event.args.id);
          try {
            // Get full dataset info from contract
            const dataset = await this.getDataset(datasetId);
            datasets.push(dataset);
          } catch (error) {
            console.warn(`⚠️ Failed to get dataset ${datasetId}:`, error);
          }
        }
      }
      
      console.log(`✅ Retrieved ${datasets.length} datasets from events`);
      return datasets;
      
    } catch (error) {
      console.error('❌ Failed to get datasets from events:', error);
      throw new Error(`Failed to get datasets from events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }
}
