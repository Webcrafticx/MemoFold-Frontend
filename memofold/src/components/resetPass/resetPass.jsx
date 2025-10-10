import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/logo.png";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { resetPassword, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (!token) {
            setErrors({ general: "Invalid or expired reset link" });
            return;
        }

        const result = await resetPassword(token, formData.newPassword);
        if (result.success) {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 transition-all hover:shadow-2xl">
                <div className="flex flex-col items-center">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-3 mb-6">
                        <img
                            src={logo}
                            alt="MemoFold Logo"
                            className="w-12 h-12 rounded-xl shadow-md"
                        />
                        <h1 className="text-2xl font-bold text-gray-900">
                            MemoFold
                        </h1>
                    </div>

                    {/* Heading */}
                    <h2 className="text-xl font-semibold text-blue-600 mb-2">
                        Reset your password
                    </h2>
                    <p className="text-gray-500 text-center mb-6">
                        Enter your new password below.
                    </p>

                    {(error || errors.general) && (
                        <div className="mb-4 w-full p-2 bg-red-100 text-red-700 rounded text-sm">
                            {error || errors.general}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="mb-4">
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="New Password"
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    errors.newPassword
                                        ? "border-red-500"
                                        : "border-gray-300"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                required
                            />
                            {errors.newPassword && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.newPassword}
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                className={`w-full px-4 py-3 rounded-xl border ${
                                    errors.confirmPassword
                                        ? "border-red-500"
                                        : "border-gray-300"
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                required
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 cursor-pointer text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 hover:scale-[1.02] transition-all disabled:opacity-70"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 hover:scale-[1.02] transition-all"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
