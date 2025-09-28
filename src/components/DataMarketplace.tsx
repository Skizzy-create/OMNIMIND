import React from 'react';
import { Database, Shield, User, ExternalLink, Copy } from 'lucide-react';

interface DataSet {
  name: string;
  description: string;
  fileURI: string;
  dataHash: string;
  creator: string;
  proof: string;
}

const DataMarketplace: React.FC = () => {
  // Static data for the 4 cards
  const datasets: DataSet[] = [
    {
      name: "DataNFT #12",
      description: "Verified Crypto Dataset from API Source",
      fileURI: "filecoin://bafy...",
      dataHash: "0xabc123...",
      creator: "0xUser",
      proof: "zkTLS proof reference"
    },
    {
      name: "DataNFT #8",
      description: "Real-time Market Data Collection",
      fileURI: "filecoin://bafy...",
      dataHash: "0xdef456...",
      creator: "0xTrader",
      proof: "zkTLS proof reference"
    },
    {
      name: "DataNFT #15",
      description: "Historical Price Analytics Dataset",
      fileURI: "filecoin://bafy...",
      dataHash: "0xghi789...",
      creator: "0xAnalyst",
      proof: "zkTLS proof reference"
    },
    {
      name: "DataNFT #23",
      description: "DeFi Protocol Transaction Data",
      fileURI: "filecoin://bafy...",
      dataHash: "0xjkl012...",
      creator: "0xDeFi",
      proof: "zkTLS proof reference"
    }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log(`${label} copied to clipboard`);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {datasets.map((dataset, index) => (
          <div
            key={index}
            className="border p-8 hover:shadow-lg transition-shadow duration-300"
            style={{
              background: '#ffffff',
              border: '1px solid #000000',
              padding: '2rem',
              cursor: 'pointer'
            }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 border flex items-center justify-center mr-4"
                  style={{
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #000000'
                  }}
                >
                  <Database 
                    className="w-6 h-6" 
                    style={{ color: '#ffffff' }}
                  />
                </div>
                <div>
                  <h3 
                    className="text-xl font-bold mb-1"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#000000',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {dataset.name}
                  </h3>
                  <p 
                    className="text-sm text-gray"
                    style={{
                      fontSize: '0.875rem',
                      color: '#666666'
                    }}
                  >
                    {dataset.description}
                  </p>
                </div>
              </div>
              <button
                className="p-2 border hover:bg-gray-50"
                style={{
                  background: '#ffffff',
                  border: '1px solid #000000',
                  padding: '0.5rem'
                }}
                title="View external link"
              >
                <ExternalLink className="w-4 h-4" style={{ color: '#000000' }} />
              </button>
            </div>

            {/* Dataset Details */}
            <div className="space-y-4">
              {/* File URI */}
              <div className="flex items-center justify-between p-3 border" style={{ background: '#f9f9f9', border: '1px solid #cccccc' }}>
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
                  <span className="text-sm font-medium">File URI:</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-2" style={{ color: '#000000' }}>{dataset.fileURI}</span>
                  <button
                    onClick={() => copyToClipboard(dataset.fileURI, 'File URI')}
                    className="p-1 hover:bg-gray-200"
                    style={{ padding: '0.25rem' }}
                  >
                    <Copy className="w-3 h-3" style={{ color: '#666666' }} />
                  </button>
                </div>
              </div>

              {/* Data Hash */}
              <div className="flex items-center justify-between p-3 border" style={{ background: '#f9f9f9', border: '1px solid #cccccc' }}>
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
                  <span className="text-sm font-medium">Data Hash:</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-2" style={{ color: '#000000' }}>{dataset.dataHash}</span>
                  <button
                    onClick={() => copyToClipboard(dataset.dataHash, 'Data Hash')}
                    className="p-1 hover:bg-gray-200"
                    style={{ padding: '0.25rem' }}
                  >
                    <Copy className="w-3 h-3" style={{ color: '#666666' }} />
                  </button>
                </div>
              </div>

              {/* Creator */}
              <div className="flex items-center justify-between p-3 border" style={{ background: '#f9f9f9', border: '1px solid #cccccc' }}>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
                  <span className="text-sm font-medium">Creator:</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-2" style={{ color: '#000000' }}>{shortenAddress(dataset.creator)}</span>
                  <button
                    onClick={() => copyToClipboard(dataset.creator, 'Creator Address')}
                    className="p-1 hover:bg-gray-200"
                    style={{ padding: '0.25rem' }}
                  >
                    <Copy className="w-3 h-3" style={{ color: '#666666' }} />
                  </button>
                </div>
              </div>

              {/* Proof */}
              <div className="flex items-center justify-between p-3 border" style={{ background: '#f9f9f9', border: '1px solid #cccccc' }}>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" style={{ color: '#000000' }} />
                  <span className="text-sm font-medium">Proof:</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-2" style={{ color: '#000000' }}>{dataset.proof}</span>
                  <button
                    onClick={() => copyToClipboard(dataset.proof, 'Proof Reference')}
                    className="p-1 hover:bg-gray-200"
                    style={{ padding: '0.25rem' }}
                  >
                    <Copy className="w-3 h-3" style={{ color: '#666666' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                className="flex-1 btn py-3 px-6 font-semibold"
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid #000000',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600'
                }}
              >
                Purchase Dataset
              </button>
              <button
                className="px-6 py-3 border font-semibold"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  border: '1px solid #000000',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600'
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

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
            100%
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
            zkTLS
          </div>
          <div className="text-sm text-gray" style={{ color: '#666666' }}>
            Proof System
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
            ∞
          </div>
          <div className="text-sm text-gray" style={{ color: '#666666' }}>
            Storage Limit
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMarketplace;
