import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import About from "./components/about/about";
import ContactUploading from "./components/contact_uploading/contact_uploading";
import ForgotPassword from "./components/forgot_pass/forgot_pass";
import FeedbackForm from "./components/feedback/feedback";
import HelpPage from "./components/help/help";
import LoginPage from "./components/login/login";
import SignUp from "./components/signUp/signUp";
import MainFeed from "./components/mainFeed/mainFeed";
import MaintenancePage from "./components/maintenance/maintenance";
import PrivacyPolicy from "./components/privacy/privacy";
import ProfilePage from "./components/profile/profile";
import ResetPassword from "./components/resetPass/resetPass";
import Survey from "./components/survey/survey";
import MainDashboard from "./components/updMain/updMain";

// Authentication wrapper component
const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication status (replace with your actual auth check)
        const checkAuth = async () => {
            const token = localStorage.getItem("authToken");
            setIsAuthenticated(!!token);
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Check maintenance mode (could be from an API call)
    useEffect(() => {
        // Simulate maintenance mode check
        const maintenanceCheck = async () => {
            try {
                setMaintenanceMode(false); // Default to false for now
            } catch (error) {
                console.error("Error checking maintenance mode:", error);
            }
        };
        maintenanceCheck();
    }, []);

    if (maintenanceMode) {
        return <MaintenancePage />;
    }

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />
                        <Route
                            path="/reset-password/:token"
                            element={<ResetPassword />}
                        />
                        <Route path="/about" element={<About />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/help" element={<HelpPage />} />
                        <Route path="/feedback" element={<FeedbackForm />} />
                        <Route
                            path="/contact-uploading"
                            element={<ContactUploading />}
                        />
                        <Route
                            path="/maintenance"
                            element={<MaintenancePage />}
                        />
                        <Route path="/survey" element={<Survey />} />

                        {/* Protected Routes */}
                        <Route
                            path="/feed"
                            element={
                                <ProtectedRoute>
                                    <MainFeed />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <MainDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />

                        {/* 404 Page */}
                        <Route
                            path="*"
                            element={
                                <div className="flex items-center justify-center min-h-[60vh]">
                                    <div className="text-center">
                                        <h1 className="text-4xl font-bold mb-4">
                                            404 - Page Not Found
                                        </h1>
                                        <p className="text-xl mb-6">
                                            The page you're looking for doesn't
                                            exist.
                                        </p>
                                        <a
                                            href="/"
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Return Home
                                        </a>
                                    </div>
                                </div>
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
