import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Educational React Class Component: ErrorBoundary
 *
 * Demonstrates:
 * 1. Class-based React component lifecycle methods: getDerivedStateFromError & componentDidCatch
 * 2. Component state management with this.state and this.setState
 * 3. Graceful UI degradation and error logging in React
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // Update state so the next render will show the fallback UI.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log error details for diagnostics
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              Something went wrong
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            </p>

            <button
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <RefreshCw size={16} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
