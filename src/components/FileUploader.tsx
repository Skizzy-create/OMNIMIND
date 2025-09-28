import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Download, Zap, Clock } from 'lucide-react';
import { WalrusService, UploadProgress, WalrusFile } from '../services/walrusService';
import { EmbeddingService, EmbeddingResponse } from '../services/embeddingService';
import { ContractService, UploadData } from '../services/contractService';
import { ethers } from 'ethers';

interface FileUploaderProps {
  onUploadComplete?: (file: WalrusFile, embeddingData?: EmbeddingResponse) => void;
}

interface ProcessingState {
  isProcessing: boolean;
  processingType: 'fast' | 'slow' | null;
  embeddingData: EmbeddingResponse | null;
  contractData: {
    datasetId: number;
    transactionHash: string;
  } | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<WalrusFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    processingType: null,
    embeddingData: null,
    contractData: null
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const walrusService = useRef<WalrusService | null>(null);
  const embeddingService = useRef<EmbeddingService>(new EmbeddingService());
  const contractService = useRef<ContractService>(new ContractService());

  // Initialize Walrus service with your SUI address
  React.useEffect(() => {
    const initService = async () => {
      try {
        // Initialize with balance checking
        walrusService.current = await WalrusService.createWithKeypair();
        console.log('✅ Walrus service initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Walrus service:', error);
        setError('Failed to initialize Walrus service. Please check console for details.');
      }
    };
    
    initService();
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  }, []);

  // Handle file input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  }, []);

  // Handle file upload with embedding processing
  const handleUploadWithEmbedding = useCallback(async (processingType: 'fast' | 'slow') => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    // Check if service is initialized
    if (!walrusService.current) {
      setError('Walrus service is not initialized yet. Please wait...');
      return;
    }

    setUploading(true);
    setProcessingState({
      isProcessing: true,
      processingType,
      embeddingData: null,
      contractData: null
    });
    setError(null);
    setUploadProgress(null);

    try {
      // Step 1: Upload to Walrus
      const walrusFile = await walrusService.current.uploadFile(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Convert file to keccak data hash
      const dataset = JSON.stringify(walrusFile);
      const datasetHash = ethers.keccak256(ethers.toUtf8Bytes(dataset));
      console.log('Dataset Hash:', datasetHash);

      // Step 2: Test connectivity and extract text from file
      setUploadProgress({
        loaded: 100,
        total: 100,
        percentage: 100,
        progress: 100,
        message: 'Testing connectivity...',
        phase: 'Embedding'
      });

      // Test connectivity first
      const isConnected = await embeddingService.current.testConnectivity();
      if (!isConnected) {
        throw new Error('Cannot connect to embedding service. Please check if the server is running and accessible.');
      }

      setUploadProgress({
        loaded: 100,
        total: 100,
        percentage: 100,
        progress: 100,
        message: 'Processing embeddings...',
        phase: 'Embedding'
      });

      const textContent = await embeddingService.current.extractTextFromFile(selectedFile);
      const texts = textContent.split('\n').filter(line => line.trim().length > 0);

      console.log('Extracted texts for embedding:', texts);

      let embeddingResponse: EmbeddingResponse;
      if (processingType === 'fast') {
        embeddingResponse = await embeddingService.current.embedSmall({
          texts: texts.slice(0, 10), // Limit for fast processing
          batch_size: 64
        });
      } else {
        embeddingResponse = await embeddingService.current.embedLarge({
          texts,
          batch_size: 32
        });
      }

      // Add embedding data to walrus file
      const walrusFileWithEmbedding = {
        ...walrusFile,
        embeddingData: {
          data_id: embeddingResponse.data_id,
          processingType
        }
      };

      // Step 3: Register in smart contract
      setUploadProgress({
        loaded: 100,
        total: 100,
        percentage: 100,
        progress: 100,
        message: 'Registering in smart contract...',
        phase: 'Contract'
      });

      // Connect to wallet if not already connected
      if (!contractService.current.isConnected()) {
        await contractService.current.connectWallet();
      }

      // Prepare upload data for contract
      const uploadData: UploadData = {
        blobId: walrusFile.blobId || '',
        dataId: embeddingResponse.data_id,
        datasetHash: datasetHash,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        processingType
      };

      // Register dataset in contract
      const datasetId = await contractService.current.registerDataset(uploadData);
      
      // Verify the dataset
      await contractService.current.verifyDataset(datasetId);

      setProcessingState({
        isProcessing: false,
        processingType: null,
        embeddingData: embeddingResponse,
        contractData: {
          datasetId,
          transactionHash: 'Contract transaction completed'
        }
      });

      // Add contract data to walrus file
      const walrusFileWithContract = {
        ...walrusFileWithEmbedding,
        contractData: {
          datasetId,
          transactionHash: 'Contract transaction completed'
        }
      };

      setUploadedFiles(prev => [walrusFileWithContract, ...prev]);
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      onUploadComplete?.(walrusFileWithContract, embeddingResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProcessingState({
        isProcessing: false,
        processingType: null,
        embeddingData: null,
        contractData: null
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [selectedFile, onUploadComplete]);

  // Handle simple upload without embedding (fallback)
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!walrusService.current) {
      setError('Walrus service is not initialized yet. Please wait...');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(null);

    try {
      const walrusFile = await walrusService.current.uploadFile(
        selectedFile,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const dataset = JSON.stringify(walrusFile);
      const datasetHash = ethers.keccak256(ethers.toUtf8Bytes(dataset));
      console.log('Dataset Hash:', datasetHash);

      // Register in smart contract (without embedding data)
      setUploadProgress({
        loaded: 100,
        total: 100,
        percentage: 100,
        progress: 100,
        message: 'Registering in smart contract...',
        phase: 'Contract'
      });

      // Connect to wallet if not already connected
      if (!contractService.current.isConnected()) {
        await contractService.current.connectWallet();
      }

      // Prepare upload data for contract
      const uploadData: UploadData = {
        blobId: walrusFile.blobId || '',
        dataId: '', // No embedding data for simple upload
        datasetHash: datasetHash,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        processingType: 'fast' // Default to fast for simple upload
      };

      // Register dataset in contract
      const datasetId = await contractService.current.registerDataset(uploadData);
      
      // Verify the dataset
      await contractService.current.verifyDataset(datasetId);

      // Add contract data to walrus file
      const walrusFileWithContract = {
        ...walrusFile,
        contractData: {
          datasetId,
          transactionHash: 'Contract transaction completed'
        }
      };

      setUploadedFiles(prev => [walrusFileWithContract, ...prev]);
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      onUploadComplete?.(walrusFileWithContract);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [selectedFile, onUploadComplete]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div 
      className="w-full max-w-5xl mx-auto"
      style={{
        width: '100%',
        maxWidth: '80rem',
        margin: '0 auto'
      }}
    >
      <div 
        className="border overflow-hidden"
        style={{
          background: '#ffffff',
          border: '1px solid #000000',
          overflow: 'hidden'
        }}
      >
        {/* Upload Area */}
        <div 
          className="p-8"
          style={{
            padding: '2rem'
          }}
        >
          <div 
            className="text-center mb-8"
            style={{
              textAlign: 'center',
              marginBottom: '2rem'
            }}
          >
            <h2 
              className="text-3xl font-bold mb-2"
              style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#000000',
                marginBottom: '0.5rem'
              }}
            >
              Upload Dataset to OmniMind
            </h2>
            <p 
              className="text-gray"
              style={{
                color: '#666666'
              }}
            >
              Store your files on the decentralized network
            </p>
          </div>
          
          <div
            className={`upload-area relative border-2 border-dashed p-12 text-center ${
              dragActive ? 'drag-active' : ''
            }`}
            style={{
              position: 'relative',
              border: '2px dashed #000000',
              padding: '3rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? '#f0f0f0' : '#ffffff'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
              onChange={handleChange}
              accept="*/*"
            />
            
            <div 
              className="text-center"
              style={{ textAlign: 'center' }}
            >
              <div 
                className="w-20 h-20 mx-auto mb-6 border flex items-center justify-center"
                style={{
                  width: '5rem',
                  height: '5rem',
                  margin: '0 auto 1.5rem auto',
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Upload 
                  className="h-10 w-10" 
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    color: '#ffffff'
                  }}
                />
              </div>
              <p 
                className="text-lg mb-2"
                style={{
                  fontSize: '1.125rem',
                  color: '#000000',
                  marginBottom: '0.5rem'
                }}
              >
                <span 
                  className="font-semibold"
                  style={{
                    fontWeight: '600',
                    color: '#000000'
                  }}
                >
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p 
                className="text-sm text-gray"
                style={{
                  fontSize: '0.875rem',
                  color: '#666666'
                }}
              >
                Any file up to 500MB • Secure & Decentralized
              </p>
            </div>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="mt-6 p-6 border" style={{ background: '#f9f9f9', border: '1px solid #000000' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 border flex items-center justify-center" style={{ background: '#000000', color: '#ffffff' }}>
                    <File className="h-6 w-6" style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <p className="text-base font-semibold">{selectedFile.name}</p>
                    <p className="text-sm text-gray">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeSelectedFile}
                  className="text-gray hover:text-black"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUploadWithEmbedding('fast')}
                    disabled={uploading}
                    className="flex items-center justify-center py-3 px-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed border"
                    style={{
                      background: uploading && processingState.processingType === 'fast' ? '#666666' : '#22c55e',
                      color: '#ffffff',
                      border: '1px solid #000000'
                    }}
                  >
                    {uploading && processingState.processingType === 'fast' ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Fast Route
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleUploadWithEmbedding('slow')}
                    disabled={uploading}
                    className="flex items-center justify-center py-3 px-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed border"
                    style={{
                      background: uploading && processingState.processingType === 'slow' ? '#666666' : '#3b82f6',
                      color: '#ffffff',
                      border: '1px solid #000000'
                    }}
                  >
                    {uploading && processingState.processingType === 'slow' ? (
                      <div className="flex items-center">
                        <div className="spinner mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Slow Route
                      </div>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full btn py-2 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border"
                  style={{
                    background: uploading && !processingState.isProcessing ? '#666666' : '#f3f4f6',
                    color: '#000000',
                    border: '1px solid #000000'
                  }}
                >
                  {uploading && !processingState.isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload to Walrus Only'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="mt-6 p-6 border" style={{ background: '#f0f0f0', border: '1px solid #000000' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold">
                  {uploadProgress.message}
                </span>
                <span className="text-sm font-medium">{uploadProgress.progress}%</span>
              </div>
              <div className="progress-bar w-full mb-3">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <div className="text-xs font-medium">
                Phase: {uploadProgress.phase}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 border flex items-center space-x-3" style={{ background: '#f0f0f0', border: '1px solid #000000' }}>
              <AlertCircle className="h-6 w-6 flex-shrink-0" style={{ color: '#000000' }} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="p-8 border-t" style={{ background: '#f9f9f9', borderTop: '1px solid #000000' }}>
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 mr-3" style={{ color: '#000000' }} />
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6 border"
                  style={{ 
                    background: '#ffffff', 
                    border: '1px solid #000000',
                    borderBottom: index < uploadedFiles.length - 1 ? '1px solid #cccccc' : '1px solid #000000'
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 border flex items-center justify-center" style={{ background: '#000000', color: '#ffffff' }}>
                      <CheckCircle className="h-6 w-6" style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                      <p className="text-base font-semibold">{file.name}</p>
                      <p className="text-sm text-gray">
                        {formatFileSize(file.size)} • Blob ID: {file.blobId?.substring(0, 20)}...
                      </p>
                      <p className="text-xs text-gray">
                        Uploaded: {file.uploadedAt?.toLocaleString()}
                      </p>
                      {file.embeddingData && (
                        <p className="text-xs text-green-600 font-medium">
                          Data ID: {file.embeddingData.data_id} ({file.embeddingData.processingType})
                        </p>
                      )}
                      {file.contractData && (
                        <p className="text-xs text-blue-600 font-medium">
                          Dataset ID: {file.contractData.datasetId} • Contract: {file.contractData.transactionHash.substring(0, 10)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border"
                      style={{ 
                        background: '#f0f0f0', 
                        border: '1px solid #000000',
                        color: '#000000'
                      }}
                      title="View file"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => {
                        if (file.blobId) {
                          navigator.clipboard.writeText(file.blobId);
                        }
                        // You could add a toast notification here
                      }}
                      className="px-4 py-2 border text-sm"
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #000000',
                        color: '#000000'
                      }}
                    >
                      Copy Blob ID
                    </button>
                    {file.embeddingData && (
                      <button
                        onClick={() => {
                          if (file.embeddingData?.data_id) {
                            navigator.clipboard.writeText(file.embeddingData.data_id);
                          }
                        }}
                        className="px-4 py-2 border text-sm"
                        style={{ 
                          background: '#22c55e', 
                          border: '1px solid #000000',
                          color: '#ffffff'
                        }}
                      >
                        Copy Data ID
                      </button>
                    )}
                    {file.contractData && (
                      <button
                        onClick={() => {
                          if (file.contractData?.datasetId) {
                            navigator.clipboard.writeText(file.contractData.datasetId.toString());
                          }
                        }}
                        className="px-4 py-2 border text-sm"
                        style={{ 
                          background: '#3b82f6', 
                          border: '1px solid #000000',
                          color: '#ffffff'
                        }}
                      >
                        Copy Dataset ID
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
