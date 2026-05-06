import React from 'react';
import { AlertCircle, RotateCcw, Home, ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          width: '100vw', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'radial-gradient(circle at center, #111827 0%, #000 100%)',
          color: 'white',
          fontFamily: "'Outfit', sans-serif",
          padding: '2rem',
          textAlign: 'center',
          overflow: 'hidden',
          position: 'fixed',
          inset: 0,
          zIndex: 99999
        }}>
          {/* Decorative Elements */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '50%', blur: '100px' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(249, 115, 22, 0.05)', borderRadius: '50%', blur: '100px' }} />

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            backdropFilter: 'blur(20px)', 
            padding: '4rem 3rem', 
            borderRadius: '3rem', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxWidth: '600px',
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '2.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 2.5rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
            }}>
              <ShieldAlert size={50} color="#ef4444" />
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.03em' }}>System Breach</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: 1.6, fontWeight: 500 }}>
              An unexpected runtime exception has occurred. Our engineers have been notified and are investigating the protocol failure.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1.5rem', marginBottom: '3rem', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'left' }}>
              <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Error Stack</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', fontFamily: 'monospace', wordBreak: 'break-all', maxHeight: '100px', overflowY: 'auto' }}>
                {this.state.error?.toString() || 'Unknown Reference Error'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={this.handleReset}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  background: 'white', 
                  color: 'black', 
                  padding: '1rem 2rem', 
                  borderRadius: '1.25rem', 
                  border: 'none', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <RotateCcw size={18} /> Reinitialize App
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  color: 'white', 
                  padding: '1rem 2rem', 
                  borderRadius: '1.25rem', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  fontWeight: 800, 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                <Home size={18} /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
