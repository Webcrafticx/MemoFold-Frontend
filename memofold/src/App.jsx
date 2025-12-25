import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import ApiDocumentation from "./components/ApiDocumentation";
import TermsOfService from "./components/terms/terms";
import { useAuth } from "./hooks/useAuth";
import UserProfile from "./components/UserProfile";
import Post from "./components/post/Post";
import ChatPage from "./components/chat/ChatPage";
import CallPage from "./components/chat/CallPage";
import socket from "./socket";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});


const ProtectedRoute = ({ children }) => {
    const { token } = useAuth();

 
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public route for already authenticated users
const PublicRoute = ({ children }) => {
    const { token } = useAuth();

    // Agar token hai toh feed pe redirect
    if (token) {
        return <Navigate to="/feed" replace />;
    }

    return children;
};

function App() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const { token } = useAuth();
    const user = JSON.parse(localStorage.getItem("user"));
    // Check maintenance mode (could be from an API call)
    useEffect(() => {
        const maintenanceCheck = async () => {
            try {
                // In a real app, you would fetch this from your API
                setMaintenanceMode(false); // Default to false for now
            } catch (error) {
                console.error("Error checking maintenance mode:", error);
            }
        };
        maintenanceCheck();
    }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.error("SW error", err));
    }
  }, []);

  useEffect(() => {
  if (token && user?._id) {
    socket.connect();
    socket.emit("join", user._id);
    console.log("Socket connected and joined room:", user._id);
  }

  return () => {
    socket.disconnect();
  };
}, [token, user]);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const protectedPaths = ['/feed', '/profile', '/chat', '/call'];
        const isProtectedPath = protectedPaths.some(path => currentPath.includes(path));
        
        if (!token && isProtectedPath) {
            window.location.href = '/login';
        }
    }, [token]);

    if (maintenanceMode) {
        return <MaintenancePage />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <div className="min-h-screen flex flex-col bg-gray-50">
                    <main className="flex-grow">
                        <Routes>
                            {/* Public Routes */}
                            <Route
                                path="/login"
                                element={
                                    <PublicRoute>
                                        <LoginPage />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/signup"
                                element={
                                    <PublicRoute>
                                        <SignUp />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/forgot-password"
                                element={
                                    <PublicRoute>
                                        <ForgotPassword />
                                    </PublicRoute>
                                }
                            />
                            <Route
                                path="/reset-password/:token"
                                element={
                                    <PublicRoute>
                                        <ResetPassword />
                                    </PublicRoute>
                                }
                            />

                            {/* Other public routes that don't need auth check */}
                            <Route
                                path="/"
                                element={<Navigate to="/feed" replace />}
                            />
                            <Route path="/api" element={<ApiDocumentation />} />
                            <Route path="/about" element={<About />} />
                            <Route
                                path="/privacy"
                                element={<PrivacyPolicy />}
                            />
                            <Route path="/help" element={<HelpPage />} />
                            <Route
                                path="/feedback"
                                element={<FeedbackForm />}
                            />
                            <Route path="/terms" element={<TermsOfService />} />
                            <Route
                                path="/contact"
                                element={<ContactUploading />}
                            />
                            <Route
                                path="/maintenance"
                                element={<MaintenancePage />}
                            />
                            <Route path="/survey" element={<Survey />} />
                            <Route
                                path="/user/:userId"
                                element={<UserProfile />}
                            />
                            <Route path="/post/:postId" element={<Post />} />

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
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Chat Route */}
                            <Route
                                path="/chat/:id"
                                element={
                                    <ProtectedRoute>
                                        <ChatPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Video Call Route  */}
                            <Route
                                path="/call/:channelId"
                                element={
                                    <ProtectedRoute>
                                        <CallPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* 404 Page */}
                            <Route
                                path="*"
                                element={
                                    <div className="flex items-center justify-center min-h-[70vh] px-4">
                                        <div className="text-center max-w-lg">
                                            <div className="mb-6">
                                                <span className="text-7xl">
                                                    🚧
                                                </span>
                                            </div>
                                            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
                                                404 - Page Not Found
                                            </h1>
                                            <p className="text-lg sm:text-xl text-gray-600 mb-8">
                                                Oops! Looks like this page
                                                wandered off. Let's get you back
                                                on track.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <a
                                                    href="/feed"
                                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                                                >
                                                    Return to Feed
                                                </a>
                                                <a
                                                    href="/"
                                                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                                                >
                                                    Go Home
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                }
                            />
                        </Routes>
                    </main>
                </div>
                
            </Router>
        </QueryClientProvider>
    );
}

export default App;