import React from 'react';

const ProblemSlide: React.FC = () => {
  return (
    <div className="slide">
      <h1 className="slide-title">
        AI Agents Are Scaling, But They Lack Intelligence
      </h1>
      
      <div className="slide-content-section">
        <h3>The Challenge:</h3>
        <div className="grid-2">
          <div className="card">
            <h4>Massive Scale</h4>
            <p><span className="highlight">1M+ Web3 AI agents</span> projected by end of 2025</p>
            <p>Each agent needs domain-specific knowledge to be useful</p>
          </div>
          <div className="card">
            <h4>Knowledge Silos</h4>
            <p>Data trapped in <span className="highlight">centralized platforms</span></p>
            <p>No shared intelligence between projects</p>
          </div>
        </div>
      </div>

      <div className="slide-content-section">
        <h3>The Pain Points:</h3>
        <div className="grid-3">
          <div className="card">
            <div className="stat-number">85%</div>
            <div className="stat-label">of AI agent projects fail</div>
            <p>due to inadequate knowledge access</p>
          </div>
          <div className="card">
            <h4>Expensive Solutions</h4>
            <p>Fine-tuning costs <span className="highlight">$50K-$500K</span> per model</p>
            <p>Only big players can afford comprehensive training</p>
          </div>
          <div className="card">
            <h4>No Shared Intelligence</h4>
            <p>Every project rebuilds the same knowledge base</p>
            <p>Agents can execute but can't understand context</p>
          </div>
        </div>
      </div>

      <div className="slide-content-section" style={{ 
        background: '#ffffff',
        padding: '1rem',
        borderRadius: '4px',
        border: '2px solid #000000',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#000000', marginBottom: '1rem' }}>
          The Market Gap
        </h3>
        <p style={{ fontSize: '1rem', color: '#000000', fontStyle: 'italic' }}>
          Current Web3 AI focuses on compute, ignores the knowledge layer.<br />
          Agents can execute but can't understand domain-specific contexts.
        </p>
      </div>
    </div>
  );
};

export default ProblemSlide;
