import React from 'react';

const GrowthSlide: React.FC = () => {
  return (
    <div className="slide">
      <h1 className="slide-title">
        Path to $100M ARR in 4 Years
      </h1>
      
      <div className="slide-content-section">
        <h3>Revenue Projections:</h3>
        <div style={{ 
          background: '#f8f9fa',
          padding: '2rem',
          borderRadius: '15px',
          border: '2px solid #667eea',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
            <div>
              <div className="stat-number" style={{ fontSize: '2rem' }}>2025</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>1,000</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Active Agents</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000000' }}>$600K</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Annual Revenue</div>
            </div>
            <div>
              <div className="stat-number" style={{ fontSize: '2rem' }}>2026</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>10,000</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Active Agents</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000000' }}>$9M</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Annual Revenue</div>
            </div>
            <div>
              <div className="stat-number" style={{ fontSize: '2rem' }}>2027</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>50,000</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Active Agents</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000000' }}>$90M</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Annual Revenue</div>
            </div>
            <div>
              <div className="stat-number" style={{ fontSize: '2rem' }}>2028</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>200,000</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Active Agents</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#000000' }}>$360M</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>Annual Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>Go-to-Market Strategy:</h3>
        <div className="grid-3">
          <div className="card" style={{ borderLeft: '4px solid #000000' }}>
            <h4>Phase 1: Developer-First</h4>
            <p><strong>Months 1-6</strong></p>
            <ul style={{ fontSize: '0.9rem' }}>
              <li>Target existing 10,000+ Web3 AI agents</li>
              <li>Integration partnerships with Virtuals Protocol, Fetch.ai</li>
              <li>Developer tools & SDKs</li>
              <li>ETHGlobal hackathon presence</li>
            </ul>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #fdcb6e' }}>
            <h4>Phase 2: Vertical Expansion</h4>
            <p><strong>Months 6-12</strong></p>
            <ul style={{ fontSize: '0.9rem' }}>
              <li>DeFi agents: Market analysis, protocol intelligence</li>
              <li>Governance agents: Proposal context, voting intelligence</li>
              <li>Trading agents: Multi-source market data</li>
            </ul>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #e17055' }}>
            <h4>Phase 3: Platform Standard</h4>
            <p><strong>Year 2+</strong></p>
            <ul style={{ fontSize: '0.9rem' }}>
              <li>Become default knowledge layer for Web3 AI</li>
              <li>Cross-chain expansion (Ethereum, Solana, Base)</li>
              <li>Enterprise partnerships with Web2 AI companies</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>The Vision:</h3>
        <div className="grid-2">
          <div className="card">
            <h4>Short-term (12 months)</h4>
            <p><strong>The Standard Knowledge Layer</strong></p>
            <ul>
              <li>10,000+ AI agents using OmniMind</li>
              <li>100+ data providers monetizing knowledge</li>
              <li>Cross-chain presence</li>
            </ul>
          </div>
          <div className="card">
            <h4>Long-term (5+ years)</h4>
            <p><strong>Web3's Neural Network</strong></p>
            <ul>
              <li>Universal knowledge layer for all Web3 apps</li>
              <li>Cross-domain intelligence connecting DeFi, governance, gaming</li>
              <li>The infrastructure that makes Web3 truly intelligent</li>
            </ul>
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
          The Impact
        </h3>
        <p style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '1rem' }}>
          "Just as Chainlink made smart contracts reliable,<br />
          OmniMind will make AI agents intelligent."
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>85%</div>
            <div style={{ fontSize: '0.8rem' }}>Gross Margin</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>99.9%</div>
            <div style={{ fontSize: '0.8rem' }}>Uptime</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>&lt;1s</div>
            <div style={{ fontSize: '0.8rem' }}>Query Latency</div>
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
          We're Raising: $2M Seed Round
        </h4>
        <p style={{ fontSize: '1rem', color: '#000000', marginBottom: '0.5rem' }}>
          <strong>60% Engineering</strong> • <strong>20% Business Development</strong> • <strong>10% Infrastructure</strong> • <strong>10% Operations</strong>
        </p>
        <p style={{ fontSize: '0.9rem', color: '#000000', fontStyle: 'italic' }}>
          This is the Chainlink moment for AI knowledge
        </p>
      </div>
    </div>
  );
};

export default GrowthSlide;
