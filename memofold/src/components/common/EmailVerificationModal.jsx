import React, { useState } from "react";
import { apiService } from "../../services/api";

const EmailVerificationModal = ({ isOpen, onClose, token, onVerifySuccess }) => {
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSendOtp = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await apiService.sendVerificationOtp(token);
            if (res.message === "OTP sent successfully.") {
                setIsOtpSent(true);
            } else {
                setError(res.message || "Failed to send OTP.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("OTP must be 6 digits.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await apiService.verifyEmail(token, otp);
            if (res.message === "Email verified successfully.") {
                onVerifySuccess();
            } else {
                setError(res.message || "Failed to verify email.");
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    Verify Your Email
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                {!isOtpSent ? (
                    <div className="text-center">
                        <p className="text-gray-600 mb-6 text-sm">
                            You must verify your email address before you can create a post.
                        </p>
                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className={`w-full bg-[#379777] text-white py-2.5 rounded-lg font-semibold hover:bg-[#2b7a5f] transition duration-200 ${
                                loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? "Sending..." : "Send Verification Code"}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-center text-gray-600 mb-4 text-sm">
                            We've sent a 6-digit verification code to your email.
                        </p>
                        <div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center tracking-[0.5em] text-lg font-semibold focus:ring-2 focus:ring-[#379777] focus:border-transparent outline-none"
                                placeholder="000000"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#379777] text-white py-2.5 rounded-lg font-semibold hover:bg-[#2b7a5f] transition duration-200 ${
                                loading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                        >
                            {loading ? "Verifying..." : "Verify & Continue"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationModal;

