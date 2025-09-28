import React from 'react';

const SolutionSlide: React.FC = () => {
  return (
    <div className="slide">
      <h1 className="slide-title">
        dAI-Vault: Universal Knowledge Infrastructure
      </h1>
      
      <div className="slide-content-section">
        <h3>What We Built:</h3>
        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          background: '#ffffff',
          borderRadius: '4px',
          border: '2px solid #000000',
          marginBottom: '1rem'
        }}>
          <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#000000', marginBottom: '1rem' }}>
            The Chainlink of AI Knowledge
          </p>
          <p style={{ fontSize: '1rem', color: '#000000' }}>
            A decentralized infrastructure that makes Web3 AI agents actually intelligent.
          </p>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>How It Works:</h3>
        <div className="grid-2">
          <div className="card">
            <h4>1. Upload</h4>
            <p>Multi-modal data (PDFs, images, videos, text)</p>
          </div>
          <div className="card">
            <h4>2. Process</h4>
            <p>AI extracts knowledge graphs and embeddings</p>
          </div>
          <div className="card">
            <h4>3. Store</h4>
            <p>Distributed across Walrus, Akave O3, Filecoin</p>
          </div>
          <div className="card">
            <h4>4. Query</h4>
            <p>RAG system provides intelligent answers</p>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>Technical Architecture:</h3>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          margin: '2rem 0',
          padding: '1rem',
          background: '#ffffff',
          border: '2px solid #000000',
          borderRadius: '4px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem',
            textAlign: 'center',
            width: '100%'
          }}>
            <div style={{ 
              border: '1px solid #000000', 
              borderRadius: '4px', 
              padding: '0.5rem',
              background: '#ffffff'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                AI Agents & dApps
              </div>
              <div style={{ fontSize: '0.7rem' }}>Query Interface</div>
            </div>
            
            <div style={{ 
              border: '1px solid #000000', 
              borderRadius: '4px', 
              padding: '0.5rem',
              background: '#000000',
              color: '#ffffff'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                dAI-Vault API
              </div>
              <div style={{ fontSize: '0.7rem' }}>FastAPI + RAG</div>
            </div>
            
            <div style={{ 
              border: '1px solid #000000', 
              borderRadius: '4px', 
              padding: '0.5rem',
              background: '#ffffff'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Smart Answers
              </div>
              <div style={{ fontSize: '0.7rem' }}>+ Citations</div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '0.5rem',
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          <div style={{ 
            border: '1px solid #000000', 
            borderRadius: '4px', 
            padding: '0.5rem',
            background: '#ffffff'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700' }}>Walrus</div>
            <div style={{ fontSize: '0.6rem' }}>Raw Data</div>
          </div>
          <div style={{ 
            border: '1px solid #000000', 
            borderRadius: '4px', 
            padding: '0.5rem',
            background: '#ffffff'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700' }}>Akave O3</div>
            <div style={{ fontSize: '0.6rem' }}>Fast KG</div>
          </div>
          <div style={{ 
            border: '1px solid #000000', 
            borderRadius: '4px', 
            padding: '0.5rem',
            background: '#ffffff'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700' }}>Lighthouse</div>
            <div style={{ fontSize: '0.6rem' }}>Embeddings</div>
          </div>
          <div style={{ 
            border: '1px solid #000000', 
            borderRadius: '4px', 
            padding: '0.5rem',
            background: '#ffffff'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700' }}>Filecoin</div>
            <div style={{ fontSize: '0.6rem' }}>Warm Store</div>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>Key Innovations:</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ 
            background: '#000000', 
            color: '#ffffff', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Chain-agnostic
          </div>
          <div style={{ 
            background: '#000000', 
            color: '#ffffff', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Multi-modal
          </div>
          <div style={{ 
            background: '#000000', 
            color: '#ffffff', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Automatic KG
          </div>
          <div style={{ 
            background: '#000000', 
            color: '#ffffff', 
            padding: '0.5rem 1rem', 
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Decentralized
          </div>
        </div>
      </div>

      <div className="slide-content-section" style={{ 
        background: '#ffffff',
        color: '#000000',
        padding: '1rem',
        borderRadius: '4px',
        border: '2px solid #000000',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#000000', marginBottom: '1rem' }}>
          Tech Stack
        </h3>
        <div style={{ fontSize: '0.9rem' }}>
          <p><strong>Storage:</strong> Walrus + Akave O3 + Lighthouse + Filecoin</p>
          <p><strong>Compute:</strong> Mistral 7B + BLIP + Pixtral</p>
          <p><strong>API:</strong> FastAPI with optimized threading</p>
        </div>
        <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: '700' }}>
          Sub-second queries • 30 cores processing • 99.9% uptime
        </div>
      </div>
    </div>
  );
};

export default SolutionSlide;