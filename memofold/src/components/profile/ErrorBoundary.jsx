import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="text-red-500 text-6xl mb-4">
                            <FaExclamationTriangle />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We apologize for the inconvenience. Please try
                            refreshing the page.
                        </p>
                        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-40">
                            <p className="text-sm font-mono text-red-500">
                                {this.state.error &&
                                    this.state.error.toString()}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;