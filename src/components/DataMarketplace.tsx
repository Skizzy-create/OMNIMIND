import React, { useState, useEffect } from 'react';
import { Database, Shield, User, ExternalLink, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import RAGChatbot from './RAGChatbot';
import { ContractService, ContractDataset } from '../services/contractService';

interface DataSet {
  name: string;
  description: string;
  fileURI: string;
  dataHash: string;
  creator: string;
  proof: string;
}

interface DataMarketplaceProps {
  setCurrentPage?: (page: 'upload' | 'marketplace' | 'presentation') => void;
}

const DataMarketplace: React.FC<DataMarketplaceProps> = ({ setCurrentPage }) => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [storedDataIds, setStoredDataIds] = useState<any[]>([]);
  const [contractDatasets, setContractDatasets] = useState<ContractDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractService] = useState(new ContractService('https://sepolia.base.org'));

  // Load stored Data IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('storedDataIds');
      if (stored) {
        const parsedData = JSON.parse(stored);
        setStoredDataIds(parsedData);
      }
    } catch (error) {
      console.error('Failed to load stored Data IDs:', error);
    }
  }, []);

  // Load contract datasets
  const loadContractDatasets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Loading datasets from contract...');
      const datasets = await contractService.getAllDatasetsFromEvents();
      setContractDatasets(datasets);
      
      console.log(`✅ Loaded ${datasets.length} datasets from contract`);
    } catch (error) {
      console.error('❌ Failed to load contract datasets:', error);
      setError('Failed to load datasets from contract. Make sure you\'re connected to Base Sepolia network.');
    } finally {
      setLoading(false);
    }
  };

  // Load contract datasets on component mount
  useEffect(() => {
    loadContractDatasets();
  }, []);

  // Convert contract dataset to UI format
  const convertContractDatasetToUI = (contractDataset: ContractDataset): DataSet => {
    return {
      name: contractDataset.name,
      description: `Dataset #${contractDataset.id} - ${contractDataset.verified ? 'Verified' : 'Pending Verification'}`,
      fileURI: `base://${contractDataset.fileHash}`,
      dataHash: contractDataset.fileHash,
      creator: contractDataset.owner,
      proof: contractDataset.verified ? "Contract Verified" : "Pending Verification"
    };
  };

  // Convert localStorage data to UI format
  const convertLocalStorageDataToUI = (localData: any): DataSet => {
    return {
      name: `DataNFT #${localData.dataId.substring(0, 8)}`,
      description: `${localData.fileName} - ${localData.processingType} Processing`,
      fileURI: `walrus://${localData.dataId}`,
      dataHash: localData.dataId,
      creator: "Local Upload",
      proof: "Walrus Stored"
    };
  };

  // Get datasets to display (contract data + localStorage data)
  const getDatasetsToDisplay = (): DataSet[] => {
    const contractDataSets = contractDatasets.map(convertContractDatasetToUI);
    const localDataSets = storedDataIds.map((data) => convertLocalStorageDataToUI(data));
    
    // Combine both sources, prioritizing contract data
    return [...contractDataSets, ...localDataSets];
  };

  const datasets = getDatasetsToDisplay();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log(`${label} copied to clipboard`);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handlePurchaseData = (dataset: DataSet) => {
    // Check if we have any stored Data IDs
    if (storedDataIds.length === 0) {
      alert('No Data IDs available for RAG queries. Please upload and process some files first to generate Data IDs.');
      return;
    }

    // For demo purposes, use the first available Data ID
    // In a real implementation, you might want to match datasets with their corresponding Data IDs
    
    setSelectedDataset(dataset);
    setChatbotOpen(true);
  };

  const closeChatbot = () => {
    setChatbotOpen(false);
    setSelectedDataset(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div 
            className="w-16 h-16 border flex items-center justify-center mr-4"
            style={{
              width: '4rem',
              height: '4rem',
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Database 
              className="w-8 h-8" 
              style={{
                width: '2rem',
                height: '2rem',
                color: '#ffffff'
              }}
            />
          </div>
          <h1 
            className="text-5xl font-bold"
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#000000',
              margin: 0
            }}
          >
            Data Marketplace
          </h1>
        </div>
        <p 
          className="text-xl mb-8 max-w-3xl mx-auto"
          style={{
            fontSize: '1.25rem',
            color: '#000000',
            marginBottom: '2rem',
            maxWidth: '48rem',
            margin: '0 auto 2rem auto'
          }}
        >
          Discover and access verified datasets on the decentralized network
        </p>
        
        {/* Refresh and Status Section */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={loadContractDatasets}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border font-medium hover:bg-gray-50 disabled:opacity-50"
            style={{
              background: '#ffffff',
              border: '1px solid #000000',
              padding: '0.5rem 1rem',
              fontWeight: '500'
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Datasets
          </button>
          
          {(contractDatasets.length > 0 || storedDataIds.length > 0) && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#666666' }}>
              <Database className="w-4 h-4" />
              {contractDatasets.length} contract + {storedDataIds.length} local datasets
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center justify-center gap-2 mb-8 p-4 border" style={{ 
            background: '#fef2f2', 
            border: '1px solid #fca5a5', 
            color: '#dc2626',
            borderRadius: '0.375rem'
          }}>
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Dataset Cards Grid */}
      {datasets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {datasets.map((dataset, index) => (
          <div
            key={index}
            className="group border-2 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              padding: '0',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              overflow: 'hidden'
            }}
          >
            {/* Card Header */}
            <div 
              className="relative p-6"
              style={{
                background: '#000000',
                color: '#ffffff'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-14 h-14 flex items-center justify-center mr-4"
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px'
                    }}
                  >
                    <Database 
                      className="w-7 h-7" 
                      style={{ color: '#000000' }}
                    />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-bold mb-1"
                      style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#ffffff',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {dataset.name}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{
                        fontSize: '0.875rem',
                        color: '#cccccc'
                      }}
                    >
                      {dataset.description}
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                  style={{
                    borderRadius: '8px',
                    padding: '0.5rem'
                  }}
                  title="View external link"
                >
                  <ExternalLink className="w-4 h-4" style={{ color: '#ffffff' }} />
                </button>
              </div>
            </div>

            {/* Dataset Details */}
            <div className="p-6 space-y-4">
              {/* File URI */}
              <div 
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ 
                  background: '#ffffff',
                  border: '1px solid #000000'
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 flex items-center justify-center mr-3"
                    style={{
                      background: '#000000',
                      borderRadius: '8px'
                    }}
                  >
                    <ExternalLink className="w-4 h-4" style={{ color: '#ffffff' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#000000' }}>File URI</span>
                </div>
                <div className="flex items-center">
                  <span 
                    className="text-sm mr-2 font-mono" 
                    style={{ 
                      color: '#666666',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {dataset.fileURI}
                  </span>
                  <button
                    onClick={() => copyToClipboard(dataset.fileURI, 'File URI')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" style={{ color: '#000000' }} />
                  </button>
                </div>
              </div>

              {/* Data Hash */}
              <div 
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ 
                  background: '#f9f9f9',
                  border: '1px solid #000000'
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 flex items-center justify-center mr-3"
                    style={{
                      background: '#000000',
                      borderRadius: '8px'
                    }}
                  >
                    <Database className="w-4 h-4" style={{ color: '#ffffff' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#000000' }}>Data Hash</span>
                </div>
                <div className="flex items-center">
                  <span 
                    className="text-sm mr-2 font-mono" 
                    style={{ 
                      color: '#666666',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {dataset.dataHash}
                  </span>
                  <button
                    onClick={() => copyToClipboard(dataset.dataHash, 'Data Hash')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" style={{ color: '#000000' }} />
                  </button>
                </div>
              </div>

              {/* Creator */}
              <div 
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ 
                  background: '#ffffff',
                  border: '1px solid #000000'
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 flex items-center justify-center mr-3"
                    style={{
                      background: '#000000',
                      borderRadius: '8px'
                    }}
                  >
                    <User className="w-4 h-4" style={{ color: '#ffffff' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#000000' }}>Creator</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-2 font-mono" style={{ color: '#666666' }}>
                    {shortenAddress(dataset.creator)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(dataset.creator, 'Creator Address')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" style={{ color: '#000000' }} />
                  </button>
                </div>
              </div>

              {/* Proof */}
              <div 
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ 
                  background: '#f9f9f9',
                  border: '1px solid #000000'
                }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 flex items-center justify-center mr-3"
                    style={{
                      background: '#000000',
                      borderRadius: '8px'
                    }}
                  >
                    <Shield className="w-4 h-4" style={{ color: '#ffffff' }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#000000' }}>Proof</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-2 font-medium" style={{ color: '#666666' }}>
                    {dataset.proof}
                  </span>
                  <button
                    onClick={() => copyToClipboard(dataset.proof, 'Proof Reference')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" style={{ color: '#000000' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0">
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePurchaseData(dataset)}
                  className="flex-1 py-3 px-4 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                  style={{
                    background: '#000000',
                    color: '#ffffff',
                    fontWeight: '600',
                    border: '1px solid #000000'
                  }}
                >
                  Query Dataset
                </button>
                <button
                  className="px-4 py-3 border font-semibold rounded-lg transition-all duration-200 hover:bg-gray-50"
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid #000000',
                    fontWeight: '600'
                  }}
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div 
            className="w-24 h-24 border flex items-center justify-center mx-auto mb-6"
            style={{
              width: '6rem',
              height: '6rem',
              background: '#f9f9f9',
              color: '#666666',
              border: '1px solid #cccccc',
              borderRadius: '50%'
            }}
          >
            <Database className="w-12 h-12" style={{ color: '#666666' }} />
          </div>
          <h3 
            className="text-2xl font-bold mb-4"
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '1rem'
            }}
          >
            No Datasets Available
          </h3>
          <p 
            className="text-lg mb-8 max-w-md mx-auto"
            style={{
              fontSize: '1.125rem',
              color: '#666666',
              marginBottom: '2rem',
              maxWidth: '28rem',
              margin: '0 auto 2rem auto'
            }}
          >
            No datasets have been registered on the contract yet. Upload some files to get started!
          </p>
          <button
            onClick={() => setCurrentPage?.('upload')}
            className="btn px-8 py-3 font-semibold"
            style={{
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #000000',
              padding: '0.75rem 2rem',
              fontWeight: '600'
            }}
          >
            Upload Files
          </button>
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-16 grid md:grid-cols-4 gap-8">
        <div className="text-center">
          <div 
            className="text-4xl font-bold mb-2"
            style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '0.5rem'
            }}
          >
            {datasets.length}
          </div>
          <div className="text-sm text-gray" style={{ color: '#666666' }}>
            Available Datasets
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-4xl font-bold mb-2"
            style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '0.5rem'
            }}
          >
            {contractDatasets.length > 0 ? 
              Math.round((contractDatasets.filter(d => d.verified).length / contractDatasets.length) * 100) : 
              storedDataIds.length > 0 ? 50 : 0}%
          </div>
          <div className="text-sm text-gray" style={{ color: '#666666' }}>
            Verified Data
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-4xl font-bold mb-2"
            style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '0.5rem'
            }}
          >
            Base
          </div>
          <div className="text-sm text-gray" style={{ color: '#666666' }}>
            Network
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-4xl font-bold mb-2"
            style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '0.5rem'
            }}
          >
            {contractDatasets.length > 0 ? 'Contract' : 'Local + Contract'}
          </div>
          <div className="text-sm text-gray" style={{ color: '#666666' }}>
            Data Source
          </div>
        </div>
      </div>

      {/* RAG Chatbot Modal */}
      {selectedDataset && (
        <RAGChatbot
          isOpen={chatbotOpen}
          onClose={closeChatbot}
          dataId={storedDataIds.length > 0 ? storedDataIds[0].dataId : ''}
          datasetName={selectedDataset.name}
        />
      )}
    </div>
  );
};

export default DataMarketplace;
