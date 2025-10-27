import { Component } from 'react';

class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      message: error?.message,
      status: error?.status,
    };
  }

  componentDidCatch(_error, _errorInfo) {
    this.setState({ hasError: true });
  }

  resetErrorBoundary() {
    this.setState({ hasError: false });
  }

  render() {
    /**
     * addExtraProps
     * @param {import('react').Component} Component
     * @param {import('react').ComponentProps} extraProps
     * @returns
     */
    function addExtraProps(Component, extraProps) {
      return <Component {...Component.props} {...extraProps} />;
    }

    if (this.state.hasError) {
      return addExtraProps(this.props.fallback, {
        errorMessage: this.state.message,
        errorStatus: this.state.status ? this.state.status : 'Something is wrong!',
        reset: this.resetErrorBoundary,
      });
    }
    return this.props.children;
  }
}

export default ThreeErrorBoundary;
