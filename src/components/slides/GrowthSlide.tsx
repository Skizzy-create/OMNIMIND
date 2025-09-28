import React from 'react';

const GrowthSlide: React.FC = () => {
  return (
    <div className="slide">
      <h1 className="slide-title">
        Path to Web3 AI Dominance
      </h1>
      
      <div className="slide-content-section">
        <h3>Roadmap:</h3>
        
        <div className="grid-3">
          <div className="card" style={{ borderLeft: '4px solid #000000' }}>
            <h4>Phase 1: Foundation ✅</h4>
            <p><strong>(Current)</strong></p>
            <ul style={{ fontSize: '0.9rem' }}>
              <li>Multi-modal processing pipeline</li>
              <li>Knowledge graph generation</li>
              <li>Decentralized storage integration</li>
              <li>RAG query system</li>
              <li>Comprehensive API</li>
            </ul>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #000000' }}>
            <h4>Phase 2: Scale 🔄</h4>
            <p><strong>(Q1 2025)</strong></p>
            <ul style={{ fontSize: '0.9rem' }}>
              <li>Wallet authentication & payments</li>
              <li>Cross-chain deployment</li>
              <li>Enterprise partnerships</li>
              <li>Developer SDK release</li>
            </ul>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #000000' }}>
            <h4>Phase 3: Ecosystem 📋</h4>
            <p><strong>(Q2-Q3 2025)</strong></p>
            <ul style={{ fontSize: '0.9rem' }}>
              <li>AI agent marketplace integration</li>
              <li>Community governance launch</li>
              <li>Advanced analytics platform</li>
              <li>Global developer adoption</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>Use Cases:</h3>
        <div className="grid-2">
          <div className="card">
            <h4>DeFi Agents</h4>
            <ul style={{ fontSize: '0.9rem' }}>
              <li><strong>Market Analysis:</strong> Real-time protocol intelligence</li>
              <li><strong>Risk Assessment:</strong> Multi-source data aggregation</li>
              <li><strong>Yield Optimization:</strong> Historical performance analysis</li>
            </ul>
          </div>
          <div className="card">
            <h4>Governance Agents</h4>
            <ul style={{ fontSize: '0.9rem' }}>
              <li><strong>Proposal Context:</strong> Comprehensive background research</li>
              <li><strong>Voting Intelligence:</strong> Impact analysis and recommendations</li>
              <li><strong>Community Insights:</strong> Sentiment and trend analysis</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>Competitive Advantage:</h3>
        <div style={{ 
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '4px',
          border: '2px solid #000000',
          marginBottom: '1rem',
          width: '100%',
          maxWidth: '1000px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem', 
            fontSize: '0.9rem',
            textAlign: 'left'
          }}>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', textAlign: 'center' }}>Current Limitations:</h4>
              <ul>
                <li>Virtuals Protocol: Agent frameworks only</li>
                <li>Fetch.ai: Compute marketplace, no knowledge</li>
                <li>SingularityNET: Model trading, no knowledge graphs</li>
                <li>OpenAI/Anthropic: Centralized, expensive</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', textAlign: 'center' }}>Our Differentiation:</h4>
              <ul>
                <li>✅ Decentralized storage multi-protocol</li>
                <li>✅ Automatic knowledge graphs</li>
                <li>✅ Multi-modal processing</li>
                <li>✅ Pay-per-query economics</li>
                <li>✅ Chain-agnostic universal</li>
              </ul>
            </div>
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
          The Vision
        </h3>
        <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '1rem' }}>
          "The Standard Knowledge Layer for Web3 AI"
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>&lt;1s</div>
            <div style={{ fontSize: '0.8rem' }}>Query Latency</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>99.9%</div>
            <div style={{ fontSize: '0.8rem' }}>Uptime</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>1000+</div>
            <div style={{ fontSize: '0.8rem' }}>Queries/Min</div>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '1rem',
        textAlign: 'center',
        padding: '1rem',
        background: '#ffffff',
        borderRadius: '4px',
        border: '2px solid #000000'
      }}>
        <h4 style={{ color: '#000000', marginBottom: '1rem' }}>
          Ready for Integration
        </h4>
        <p style={{ fontSize: '1rem', color: '#000000', marginBottom: '0.5rem' }}>
          <strong>Live API Available</strong> • <strong>Comprehensive Documentation</strong> • <strong>Working Examples</strong>
        </p>
        <p style={{ fontSize: '0.9rem', color: '#000000', fontStyle: 'italic' }}>
          This is the Chainlink moment for AI knowledge
        </p>
      </div>
    </div>
  );
};

export default GrowthSlide;