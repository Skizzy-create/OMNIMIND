import React from 'react';

const CoverSlide: React.FC = () => {
  return (
    <div className="slide">
      <div className="text-center">
        <h1 className="slide-title">
          OmniMind
        </h1>
        
        <div className="slide-subtitle">
          <em>The Missing Knowledge Layer for Web3 AI Agents</em>
        </div>
        
        <div style={{ marginTop: '2rem', fontSize: '1.2rem', color: '#000000' }}>
          <p style={{ marginBottom: '1rem', fontWeight: '600' }}>
            <span className="highlight">Empowering Web3 AI</span> with Intelligent, Decentralized Knowledge
          </p>
          <p style={{ marginBottom: '2rem', fontStyle: 'italic' }}>
            Built for the future of decentralized AI
          </p>
        </div>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#ffffff',
          borderRadius: '4px',
          border: '2px solid #000000'
        }}>
          <p style={{ fontSize: '1rem', color: '#000000', marginBottom: '0.5rem' }}>
            Decentralized AI Knowledge Infrastructure
          </p>
          <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000000' }}>
            The Chainlink of AI Knowledge
          </p>
        </div>
        
        <div style={{ 
          marginTop: '3rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div className="card" style={{ minWidth: '200px', textAlign: 'center' }}>
            <div className="stat-number">1M+</div>
            <div className="stat-label">Web3 AI Agents</div>
          </div>
          <div className="card" style={{ minWidth: '200px', textAlign: 'center' }}>
            <div className="stat-number">$47B</div>
            <div className="stat-label">Market by 2030</div>
          </div>
          <div className="card" style={{ minWidth: '200px', textAlign: 'center' }}>
            <div className="stat-number">85%</div>
            <div className="stat-label">Projects Fail</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverSlide;
