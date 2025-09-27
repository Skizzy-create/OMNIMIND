import { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import WalletConnect from './components/WalletConnect';
import { walrusClient, WalrusFile } from './services/walrusService';
import './App.css';

function App() {
  const [totalUploads, setTotalUploads] = useState(0);

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
    setTotalUploads(prev => prev + 1);
    console.log('File uploaded successfully:', file);
  };

  return (
    <div className="min-h-screen" style={{ minHeight: '100vh', background: '#ffffff', color: '#000000' }}>
      {/* Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #000000' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-8">
            {/* Left side - empty for now */}
            <div></div>
            
            {/* Right side - Wallet Connect Button */}
            <div>
              <WalletConnect />
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div 
                className="w-12 h-12 border flex items-center justify-center mr-4"
                style={{
                  width: '3rem',
                  height: '3rem',
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem'
                }}
              >
                <svg 
                  className="w-8 h-8" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ width: '2rem', height: '2rem', color: '#ffffff' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h1 
                className="text-4xl font-bold"
                style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: '#000000',
                  margin: 0
                }}
              >
                Walrus Storage
              </h1>
            </div>
            <p 
              className="text-xl mb-8 max-w-2xl mx-auto"
              style={{
                fontSize: '1.25rem',
                color: '#000000',
                marginBottom: '2rem',
                maxWidth: '42rem',
                margin: '0 auto 2rem auto'
              }}
            >
              Decentralized file storage powered by Walrus Protocol
            </p>
            
            {/* Stats */}
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{totalUploads}</div>
                <div className="text-sm text-gray">Files Uploaded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm text-gray">Storage Limit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-gray">Decentralized</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <FileUploader onUploadComplete={handleUploadComplete} />
        
        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {/* Features Card */}
          <div className="border p-8" style={{ background: '#ffffff', border: '1px solid #000000' }}>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 border flex items-center justify-center mr-4" style={{ background: '#000000', color: '#ffffff' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Key Features</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 mt-2 mr-4 flex-shrink-0" style={{ background: '#000000' }}></div>
                <div>
                  <h3 className="font-semibold">Decentralized Storage</h3>
                  <p className="text-sm text-gray">High availability across distributed nodes</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 mt-2 mr-4 flex-shrink-0" style={{ background: '#000000' }}></div>
                <div>
                  <h3 className="font-semibold">Cryptographic Proofs</h3>
                  <p className="text-sm text-gray">zkTLS proofs ensure data integrity</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 mt-2 mr-4 flex-shrink-0" style={{ background: '#000000' }}></div>
                <div>
                  <h3 className="font-semibold">Fault Tolerance</h3>
                  <p className="text-sm text-gray">Efficient erasure coding for reliability</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 mt-2 mr-4 flex-shrink-0" style={{ background: '#000000' }}></div>
                <div>
                  <h3 className="font-semibold">Sui Integration</h3>
                  <p className="text-sm text-gray">Native blockchain integration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details Card */}
          <div className="border p-8" style={{ background: '#ffffff', border: '1px solid #000000' }}>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 border flex items-center justify-center mr-4" style={{ background: '#000000', color: '#ffffff' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">How It Works</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 border flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0" style={{ background: '#000000', color: '#ffffff' }}>1</div>
                <div>
                  <h3 className="font-semibold">Encode & Split</h3>
                  <p className="text-sm text-gray">Files are encoded and distributed across nodes</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 border flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0" style={{ background: '#000000', color: '#ffffff' }}>2</div>
                <div>
                  <h3 className="font-semibold">Blockchain Registration</h3>
                  <p className="text-sm text-gray">Blob IDs are registered on Sui blockchain</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 border flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0" style={{ background: '#000000', color: '#ffffff' }}>3</div>
                <div>
                  <h3 className="font-semibold">Certification</h3>
                  <p className="text-sm text-gray">Uploads are certified with cryptographic proofs</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 border flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0" style={{ background: '#000000', color: '#ffffff' }}>4</div>
                <div>
                  <h3 className="font-semibold">Permanent Access</h3>
                  <p className="text-sm text-gray">Blob IDs provide permanent, verifiable access</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center py-8">
          <p className="text-gray">
            Powered by <span className="font-semibold">Walrus Protocol</span> • 
            Built on <span className="font-semibold">Sui Blockchain</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
