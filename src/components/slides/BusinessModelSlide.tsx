import React from 'react';

const BusinessModelSlide: React.FC = () => {
  return (
    <div className="slide">
      <h1 className="slide-title">
        Sustainable Economics for All Stakeholders
      </h1>
      
      <div className="slide-content-section">
        <h3>Revenue Streams:</h3>
        
        <div className="grid-2">
          <div className="card" style={{ borderLeft: '4px solid #000000' }}>
            <h4>1. Pay-Per-Query Model (80% of revenue)</h4>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>$0.001-$0.01</strong> per query depending on complexity</p>
              <p><strong>Data providers get 70%</strong> of query revenue</p>
              <p><strong>OmniMind takes 30%</strong> platform fee</p>
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

          <div className="card" style={{ borderLeft: '4px solid #fdcb6e' }}>
            <h4>2. Premium Infrastructure (15% of revenue)</h4>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Enterprise APIs</strong> with SLA guarantees</p>
              <p><strong>Private knowledge networks</strong> for sensitive data</p>
              <p><strong>White-label solutions</strong> for large platforms</p>
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

          <div className="card" style={{ borderLeft: '4px solid #e17055' }}>
            <h4>3. Data Processing Services (5% of revenue)</h4>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Upload & embedding generation</strong> fees</p>
              <p><strong>Knowledge graph extraction</strong> premium features</p>
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
            <div className="stat-number">$50</div>
            <div className="stat-label">Customer Acquisition Cost</div>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Viral growth through network effects
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-number">$2,400</div>
            <div className="stat-label">Lifetime Value</div>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              24-month avg retention
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="stat-number">48:1</div>
            <div className="stat-label">LTV/CAC Ratio</div>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Excellent unit economics
            </p>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>Market Size & Opportunity:</h3>
        <div className="grid-2">
          <div className="card">
            <h4>Market Catalysts</h4>
            <ul style={{ fontSize: '1rem' }}>
              <li><strong>10,000+</strong> active Web3 AI agents today</li>
              <li><strong>1M+</strong> projected by EOY 2025</li>
              <li><strong>$2.3B</strong> invested in AI agent platforms in 2024</li>
              <li>Growing demand for domain-specific AI in DeFi, governance, trading</li>
            </ul>
          </div>
          <div className="card">
            <h4>Market Size</h4>
            <div style={{ textAlign: 'center' }}>
              <div className="stat-number">$47B</div>
              <div className="stat-label">AI Agent Market by 2030</div>
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                CAGR: 45% growth rate
              </p>
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
          The Opportunity
        </h3>
        <p style={{ fontSize: '1rem', marginBottom: '1rem', fontStyle: 'italic' }}>
          "AI agent success hinges entirely on data infrastructure"
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          We're at the inflection point where agents need intelligence, not just compute.
        </p>
      </div>
    </div>
  );
};

export default BusinessModelSlide;
