import React, { useState } from "react";
import logo from "../../assets/logo.png";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/request-reset",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: email.trim() }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to send reset link.");
            }

            setMessage("✅ A reset link has been sent to your email.");
            setEmail("");
        } catch (error) {
            setMessage(
                error.message || "Server error. Please try again later."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 font-['Segoe_UI'] p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-md transition-transform hover:-translate-y-1">
                {/* Logo Section */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <img
                        src={logo}
                        alt="MemoFold Logo"
                        className="w-16 h-16 sm:w-20 sm:h-20"
                    />
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        MemoFold
                    </h2>
                </div>

                {/* Title and Description */}
                <h1 className="text-xl sm:text-2xl text-blue-600 font-semibold mb-3">
                    Forgot your password?
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mb-7 px-2 sm:px-0">
                    Enter your email or username and we'll send you a link to
                    reset your password.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="mb-5">
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email or Username"
                            required
                            className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-600 active:scale-95 transition-all disabled:opacity-70"
                    >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                {/* Message Display */}
                {message && (
                    <div
                        className={`mb-6 text-center text-sm ${
                            message.includes("✅")
                                ? "text-green-600"
                                : "text-red-600"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* Back Link */}
                <div className="text-center">
                    <a
                        href="/login"
                        className="inline-block px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-full shadow-sm hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm sm:text-base"
                    >
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
