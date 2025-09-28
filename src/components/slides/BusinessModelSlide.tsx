import React from 'react';

const BusinessModelSlide: React.FC = () => {
  return (
    <div className="slide">
      <h1 className="slide-title">
        Sustainable Economics for All
      </h1>
      
      <div className="slide-content-section">
        <h3>Revenue Streams:</h3>
        
        <div className="grid-2">
          <div className="card" style={{ borderLeft: '4px solid #000000' }}>
            <h4>1. Pay-Per-Query (Primary)</h4>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>$0.001-$0.01</strong> per query based on complexity</p>
              <p><strong>Data providers earn 70%</strong> of query revenue</p>
              <p><strong>Platform takes 30%</strong> for infrastructure</p>
            </div>
            <div style={{ 
              background: '#000000', 
              color: '#ffffff', 
              padding: '0.5rem', 
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              Primary Revenue Driver
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #000000' }}>
            <h4>2. Enterprise Services</h4>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Private knowledge networks</strong> for sensitive data</p>
              <p><strong>White-label deployments</strong> for large platforms</p>
              <p><strong>SLA guarantees</strong> and premium support</p>
            </div>
            <div style={{ 
              background: '#000000', 
              color: '#ffffff', 
              padding: '0.5rem', 
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              High-Value Customers
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #000000' }}>
            <h4>3. Developer Tools</h4>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Premium APIs</strong> and advanced SDKs</p>
              <p><strong>Advanced analytics</strong> and insights</p>
              <p><strong>Custom model integration</strong> services</p>
            </div>
            <div style={{ 
              background: '#000000', 
              color: '#ffffff', 
              padding: '0.5rem', 
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              Value-Added Services
            </div>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>Unit Economics:</h3>
        <div className="grid-3">
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-number">85%</div>
            <div className="stat-label">Gross Margin</div>
            <p style={{ fontSize: '0.9rem', color: '#000000' }}>
              Software + network effects
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-number">∞</div>
            <div className="stat-label">Scalability</div>
            <p style={{ fontSize: '0.9rem', color: '#000000' }}>
              Decentralized architecture
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-number">Strong</div>
            <div className="stat-label">Network Effects</div>
            <p style={{ fontSize: '0.9rem', color: '#000000' }}>
              More data = better intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>Market Opportunity:</h3>
        <div className="grid-2">
          <div className="card">
            <h4>Market Size</h4>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <div className="stat-number">$47B</div>
              <div className="stat-label">AI Agent Market by 2030</div>
              <p style={{ fontSize: '0.9rem', color: '#000000', marginTop: '1rem' }}>
                45% CAGR growth rate
              </p>
            </div>
          </div>
          <div className="card">
            <h4>Market Catalysts</h4>
            <ul style={{ fontSize: '0.9rem' }}>
              <li><strong>10,000+</strong> active Web3 AI agents today</li>
              <li><strong>$2.3B</strong> invested in AI agent platforms in 2024</li>
              <li>Growing demand for domain-specific AI</li>
              <li>DeFi, governance, trading applications</li>
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
          Our Advantage
        </h3>
        <p style={{ fontSize: '1rem', marginBottom: '1rem', fontStyle: 'italic' }}>
          "First-mover in Web3 knowledge infrastructure"
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          Technical moats through multi-protocol integration + Network effects create sustainable competitive advantage
        </p>
      </div>
    </div>
  );
};

export default BusinessModelSlide;