import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import WalletConnect from './components/WalletConnect';
import DataMarketplace from './components/DataMarketplace';
import PresentationApp from './components/PresentationApp';
import { walrusClient, WalrusFile } from './services/walrusService';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'upload' | 'marketplace' | 'presentation'>('upload');

  // Test Walrus service on component mount
  useEffect(() => {
    console.log('🚀 App component mounted, testing Walrus service...');
    console.log('📦 Walrus client available:', walrusClient);
    
    // Test if walrus client has expected methods
    if (walrusClient) {
      console.log('✅ Walrus client is available and ready to use');
      console.log('🔧 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(walrusClient)));
    } else {
      console.error('❌ Walrus client is not available');
    }
  }, []);

  const handleUploadComplete = (file: WalrusFile) => {
    console.log('File uploaded successfully:', file);
  };

  return (
    <div className="min-h-screen" style={{ minHeight: '100vh', background: '#ffffff', color: '#000000' }}>
      {/* Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #000000',  margin: '20 auto', padding: '20px'}}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-8">
            {/* Left side - Navigation */}
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('upload')}
                className={`px-6 py-2 border font-semibold ${
                  currentPage === 'upload' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
                style={{
                  background: currentPage === 'upload' ? '#000000' : '#ffffff',
                  color: currentPage === 'upload' ? '#ffffff' : '#000000',
                  border: '1px solid #000000',
                  padding: '0.5rem 1.5rem',
                  fontWeight: '600'
                }}
              >
                Upload Files
              </button>
              <button
                onClick={() => setCurrentPage('marketplace')}
                className={`px-6 py-2 border font-semibold ${
                  currentPage === 'marketplace' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
                style={{
                  background: currentPage === 'marketplace' ? '#000000' : '#ffffff',
                  color: currentPage === 'marketplace' ? '#ffffff' : '#000000',
                  border: '1px solid #000000',
                  padding: '0.5rem 1.5rem',
                  fontWeight: '600'
                }}
              >
                Data Marketplace
              </button>
              <button
                onClick={() => setCurrentPage('presentation')}
                className={`px-6 py-2 border font-semibold ${
                  currentPage === 'presentation' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
                style={{
                  background: currentPage === 'presentation' ? '#000000' : '#ffffff',
                  color: currentPage === 'presentation' ? '#ffffff' : '#000000',
                  border: '1px solid #000000',
                  padding: '0.5rem 1.5rem',
                  fontWeight: '600'
                }}
              >
                Pitch Deck
              </button>
            </div>
            
            {/* Right side - Wallet Connect Button */}
            <div>
              <WalletConnect />
            </div>
          </div>
          <div className="text-center">
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#000000', marginBottom: '0.5rem' }}>
              OmniMind
            </h1>
            <p style={{ fontSize: '1rem', color: '#000000', fontWeight: '500' }}>
              Decentralized AI Knowledge Infrastructure
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentPage === 'upload' ? (
          <>
            <FileUploader onUploadComplete={handleUploadComplete} />
          </>
        ) : currentPage === 'marketplace' ? (
          <DataMarketplace setCurrentPage={setCurrentPage} />
        ) : (
          <PresentationApp />
        )}
      </main>
    </div>
  );
}

export default App;
