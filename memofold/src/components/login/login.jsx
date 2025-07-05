import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import snip1 from "../../assets/snip1.jpg";
import snip2 from "../../assets/snip2.jpg";
import snip3 from "../../assets/snip3.jpg";
import logo from "../../assets/logo.png";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isHovering, setIsHovering] = useState(null);
    const { login, loading, error, token } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (token) {
            navigate("/dashboard");
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.username.trim()) {
            errors.username = "Username or email is required";
        }
        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        await login(formData.username, formData.password);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row justify-center items-center lg:items-start gap-12 lg:gap-20 py-12 px-4 sm:px-6">
                {/* Story Carousel */}
                <div className="relative w-72 h-[500px] flex items-center justify-center">
                    {[snip1, snip2, snip3].map((img, index) => (
                        <div
                            key={index}
                            className={`absolute w-64 h-[450px] overflow-hidden rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 ${
                                index === 0
                                    ? "-left-8 -rotate-3"
                                    : index === 1
                                    ? "z-20"
                                    : "left-8 rotate-3"
                            } ${
                                isHovering === index
                                    ? "scale-105 -translate-y-2 z-30"
                                    : "z-10 hover:z-30"
                            }`}
                            onMouseEnter={() => setIsHovering(index)}
                            onMouseLeave={() => setIsHovering(null)}
                        >
                            <img
                                src={img}
                                alt={`Story ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-3/5 h-2 border-2 border-white rounded-full opacity-90"></div>
                        </div>
                    ))}
                </div>

                {/* Login Section */}
                <div className="w-full max-w-xs sm:max-w-sm">
                    {/* Login Box */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-lg mb-3">
                        <div className="flex flex-col items-center mb-5">
                            <img
                                src={logo}
                                alt="MemoFold Logo"
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl mb-3"
                            />
                            <div className="text-4xl sm:text-5xl font-['Billabong'] text-gray-900">
                                MemoFold
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Username or email"
                                    className={`w-full px-3 py-2 text-sm sm:text-base bg-gray-50 border rounded-md focus:outline-none ${
                                        formErrors.username
                                            ? "border-red-500"
                                            : "border-gray-200 focus:ring-1 focus:ring-blue-500"
                                    }`}
                                />
                                {formErrors.username && (
                                    <p className="mt-1 text-xs text-red-600 text-left">
                                        {formErrors.username}
                                    </p>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className={`w-full px-3 py-2 text-sm sm:text-base bg-gray-50 border rounded-md focus:outline-none ${
                                        formErrors.password
                                            ? "border-red-500"
                                            : "border-gray-200 focus:ring-1 focus:ring-blue-500"
                                    }`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                                {formErrors.password && (
                                    <p className="mt-1 text-xs text-red-600 text-left">
                                        {formErrors.password}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-md hover:from-blue-600 hover:to-cyan-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Logging in...
                                    </>
                                ) : (
                                    "Log In"
                                )}
                            </button>
                        </form>

                        <div className="my-4 flex items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="mx-4 text-sm text-gray-600">
                                OR
                            </span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-400 hover:text-blue-500 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    {/* Signup Box */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-lg">
                        <p className="text-sm sm:text-base">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-blue-400 font-bold hover:text-blue-500 hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 py-4 px-4 sm:px-6 text-center">
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-2">
                    {[
                        "About",
                        "Help",
                        "API",
                        "Privacy",
                        "Terms",
                        "Contact",
                    ].map((item) => (
                        <Link
                            key={item}
                            to={`/${item.toLowerCase()}`}
                            className="text-xs sm:text-sm text-gray-600 hover:underline"
                        >
                            {item}
                        </Link>
                    ))}
                </div>
                <div className="text-xs text-gray-500">
                    © {new Date().getFullYear()} MemoFold
                </div>
            </footer>
        </div>
    );
};

export default LoginPage;
