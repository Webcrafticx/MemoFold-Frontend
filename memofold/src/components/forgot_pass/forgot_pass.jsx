import React, { useState } from "react";
import config from "../../hooks/config";

const PasswordResetSystem = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("forgot"); // 'forgot' or 'reset'

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch(
                `${config.apiUrl}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to send verification code.");
            }

            setMessage("✅ Verification code sent to your email!");
            setActiveTab("reset"); // Switch to reset tab after sending code
        } catch (error) {
            setMessage(error.message || "Server error. Try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        if (newPassword.length < 8) {
            setMessage("Password must be at least 8 characters long.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(
                `${config.apiUrl}/auth/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim(),
                        code: code.trim(),
                        newPassword: newPassword.trim(),
                    }),
                }
            );

            if (!response.ok) {
                let errorMsg = "Failed to reset password";
                try {
                    const errorResult = await response.json();
                    errorMsg = errorResult.error || errorMsg;
                } catch (e) {
                    errorMsg = `Server error: ${response.status}`;
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            setMessage("✅ Password reset successfully! You can now login.");
            setEmail("");
            setCode("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setMessage(error.message || "Server error. Try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="flex mb-6 border-b">
                    <button
                        className={`flex-1 py-3 font-medium text-center ${
                            activeTab === "forgot"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab("forgot")}
                    >
                        Forgot Password
                    </button>
                    <button
                        className={`flex-1 py-3 font-medium text-center ${
                            activeTab === "reset"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500"
                        }`}
                        onClick={() => setActiveTab("reset")}
                    >
                        Reset Password
                    </button>
                </div>

                <h1 className="text-2xl text-blue-600 font-semibold mb-3">
                    {activeTab === "forgot"
                        ? "Reset Your Password"
                        : "Create New Password"}
                </h1>

                <p className="text-gray-600 text-sm mb-6">
                    {activeTab === "forgot"
                        ? "Enter your email to receive a verification code."
                        : "Enter the verification code and your new password."}
                </p>

                {activeTab === "forgot" ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                        >
                            {isSubmitting
                                ? "Sending..."
                                : "Send Verification Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter verification code"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={8}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="Confirm new password"
                                required
                                minLength={8}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                        >
                            {isSubmitting ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                {message && (
                    <div
                        className={`mt-4 p-3 rounded-lg text-center ${
                            message.includes("✅")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <a
                        href="/login"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetSystem;
