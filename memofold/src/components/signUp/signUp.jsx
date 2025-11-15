import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignUp = () => {
    const [formData, setFormData] = useState({
        realname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, loading, error, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate("/feed");
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        if (!formData.realname.trim()) {
            errors.realname = "Full name is required";
        } else if (formData.realname.length < 2) {
            errors.realname = "Full name must be at least 2 characters";
        }

        if (!formData.username.trim()) {
            errors.username = "Username is required";
        } else if (formData.username.length < 3) {
            errors.username = "Username must be at least 3 characters";
        } else if (!usernameRegex.test(formData.username)) {
            errors.username =
                "Username can only contain letters, numbers, and underscores";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            errors.password =
                "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setFormErrors((prev) => ({
                ...prev,
                confirmPassword: "Passwords do not match",
            }));
            return;
        }

        if (!validateForm()) return;

        await register(
            formData.realname,
            formData.username,
            formData.email,
            formData.password
        );
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 sm:p-5">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                    Create New Account
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="realname"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="realname"
                            name="realname"
                            value={formData.realname}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                                formErrors.realname
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Enter your full name"
                        />
                        {formErrors.realname && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.realname}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Username *
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                                formErrors.username
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Choose a username"
                        />
                        {formErrors.username && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.username}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="example@gmail.com"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                                formErrors.email
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                            }`}
                        />
                        {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Password *
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors pr-10 ${
                                formErrors.password
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 cursor-pointer"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <FaEyeSlash size={16} />
                            ) : (
                                <FaEye size={16} />
                            )}
                        </button>
                        {formErrors.password && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.password}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Confirm Password *
                        </label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors pr-10 ${
                                formErrors.confirmPassword
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 cursor-pointer"
                            aria-label={
                                showConfirmPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showConfirmPassword ? (
                                <FaEyeSlash size={16} />
                            ) : (
                                <FaEye size={16} />
                            )}
                        </button>
                        {formErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white py-3 rounded-lg font-bold hover:bg-gradient-to-r hover:from-[#0072ff] hover:to-[#00c6ff] transition-colors disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                Creating account...
                            </span>
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="text-center text-sm">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="text-[#58c8f4] hover:text-[#0095f6] hover:underline font-medium transition-colors"
                    >
                        Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
