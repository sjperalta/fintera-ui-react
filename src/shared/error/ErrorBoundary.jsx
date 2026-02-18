import React from "react";
import PropTypes from "prop-types";
import { useRollbar } from "@rollbar/react";
import { useLocale } from "@/contexts/LocaleContext";

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
    this.retryButtonRef = React.createRef();
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    try {
      if (this.props.rollbar) {
        this.props.rollbar.error(error, { errorInfo });
      }
    } catch {
      // swallow errors from Rollbar itself
      // but still mark that an error occurred
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // If the tree under this boundary changed, try resetting the error state.
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
      return;
    }

    // When entering the error state, autofocus the Retry button for accessibility
    if (this.state.hasError && !prevState.hasError) {
      try {
        this.retryButtonRef.current?.focus();
      } catch {
        // ignore focus errors
      }
    }
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  renderFallback() {
    const { t } = this.props.localeContext || { t: (key) => key };
    const fallback = this.props.fallback ?? (
      <div>
        <p>{t('errors.somethingWentWrong')}</p>
      </div>
    );

    return (
      <div>
        <div role="alert" aria-live="assertive">
          {fallback}
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            ref={this.retryButtonRef}
            onClick={this.handleRetry}
            className="px-3 py-1 mr-2 bg-gray-200 rounded"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }
    return this.props.children;
  }
}

ErrorBoundaryClass.propTypes = {
  fallback: PropTypes.node,
  children: PropTypes.node,
  rollbar: PropTypes.object,
  localeContext: PropTypes.shape({
    t: PropTypes.func.isRequired,
  }),
};

// Wrapper component to provide locale context and Rollbar instance to class component
const ErrorBoundaryWithLocale = (props) => {
  const localeContext = useLocale();
  const rollbar = useRollbar();
  return <ErrorBoundaryClass {...props} localeContext={localeContext} rollbar={rollbar} />;
};

export default ErrorBoundaryWithLocale;
