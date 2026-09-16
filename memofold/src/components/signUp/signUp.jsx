import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
    USERNAME_DEBOUNCE_MS,
    validateUsernameLocal,
    fetchUsernameAvailability,
} from "../../utils/usernameAvailability";
import { apiService } from "../../services/api";

const SignUp = () => {
    const [formData, setFormData] = useState({
        realname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [sendingOtp, setSendingOtp] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState({
        checking: false,
        available: null,
        message: "",
    });
    const debounceRef = useRef(null);
    const abortRef = useRef(null);
    const { register, loading, error, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate("/feed");
        }
    }, [token, navigate]);

    useEffect(() => {
        return () => {
            clearTimeout(debounceRef.current);
            abortRef.current?.abort();
        };
    }, []);

    const scheduleUsernameCheck = (username) => {
        clearTimeout(debounceRef.current);
        abortRef.current?.abort();

        const local = validateUsernameLocal(username);
        if (!local.ok) {
            setUsernameStatus({
                checking: false,
                available: local.available,
                message: local.message,
            });
            return;
        }

        // Idle until debounce fires — do not hit API yet
        setUsernameStatus({
            checking: false,
            available: null,
            message: "",
        });

        debounceRef.current = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current = controller;
            setUsernameStatus({
                checking: true,
                available: null,
                message: "Checking availability...",
            });

            try {
                const data = await fetchUsernameAvailability(local.value, {
                    signal: controller.signal,
                });
                if (controller.signal.aborted) return;
                setUsernameStatus({
                    checking: false,
                    available: data.available,
                    message: data.message,
                });
            } catch (err) {
                if (err?.name === "AbortError") return;
                setUsernameStatus({
                    checking: false,
                    available: null,
                    message: "Could not check username",
                });
            }
        }, USERNAME_DEBOUNCE_MS);
    };

    const verifyUsernameOnSubmit = async (username) => {
        clearTimeout(debounceRef.current);
        abortRef.current?.abort();

        const local = validateUsernameLocal(username);
        if (!local.ok) {
            return { ok: false, message: local.message || "Invalid username" };
        }

        try {
            const data = await fetchUsernameAvailability(local.value);
            setUsernameStatus({
                checking: false,
                available: data.available,
                message: data.message,
            });
            if (!data.available) {
                return { ok: false, message: data.message };
            }
            return { ok: true };
        } catch {
            return { ok: false, message: "Could not verify username. Please try again." };
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (name === "username") {
            scheduleUsernameCheck(value);
        }
    };

    const getMaxDob = () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 13);
        return d.toISOString().slice(0, 10);
    };

    const validateForm = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.realname.trim()) {
            errors.realname = "Full name is required";
        } else if (formData.realname.length < 2) {
            errors.realname = "Full name must be at least 2 characters";
        }

        const localUser = validateUsernameLocal(formData.username);
        if (!formData.username.trim()) {
            errors.username = "Username is required";
        } else if (!localUser.ok) {
            errors.username = localUser.message;
        } else if (usernameStatus.available === false) {
            errors.username = "Username is already taken";
        }

        if (!formData.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        } else {
            const dob = new Date(formData.dateOfBirth);
            const minAgeDate = new Date();
            minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
            if (dob > new Date()) {
                errors.dateOfBirth = "Date of birth cannot be in the future";
            } else if (dob > minAgeDate) {
                errors.dateOfBirth = "You must be at least 13 years old";
            }
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
        if (usernameStatus.checking) return;

        const verify = await verifyUsernameOnSubmit(formData.username);
        if (!verify.ok) {
            setFormErrors((prev) => ({
                ...prev,
                username: verify.message,
            }));
            return;
        }

        setSendingOtp(true);
        setOtpError("");
        try {
            const res = await apiService.sendSignupOtp({
                email: formData.email,
                username: formData.username
            });
            if (res.message === "OTP sent successfully.") {
                setIsOtpSent(true);
            } else {
                setOtpError(res.message || "Failed to send OTP.");
            }
        } catch (err) {
            setOtpError(err.message || "Something went wrong.");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setOtpError("");
        if (otp.length !== 6) {
            setOtpError("OTP must be 6 digits.");
            return;
        }

        await register(
            formData.realname,
            formData.username,
            formData.email,
            formData.password,
            formData.dateOfBirth,
            otp
        );
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4 sm:p-5">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
                {isOtpSent ? (
                    <div>
                        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                            Verify Email
                        </h2>
                        <p className="text-center text-gray-600 mb-4">
                            We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                        </p>

                        {(error || otpError) && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                                {error || otpError}
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Verification Code
                                </label>
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
                                {loading ? "Verifying..." : "Verify & Create Account"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOtpSent(false)}
                                disabled={loading}
                                className="w-full mt-2 text-[#379777] font-medium hover:underline text-sm"
                            >
                                Back
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
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
                                formErrors.username || usernameStatus.available === false
                                    ? "border-red-500"
                                    : usernameStatus.available === true
                                      ? "border-green-500"
                                      : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Choose a username"
                            autoComplete="off"
                        />
                        {formErrors.username && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.username}
                            </p>
                        )}
                        {!formErrors.username && usernameStatus.message && (
                            <p
                                className={`mt-1 text-sm ${
                                    usernameStatus.available === true
                                        ? "text-green-600"
                                        : usernameStatus.available === false
                                          ? "text-red-600"
                                          : "text-gray-500"
                                }`}
                            >
                                {usernameStatus.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="dateOfBirth"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Date of Birth *
                        </label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                            max={getMaxDob()}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                                formErrors.dateOfBirth
                                    ? "border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                            }`}
                        />
                        {formErrors.dateOfBirth && (
                            <p className="mt-1 text-sm text-red-600">
                                {formErrors.dateOfBirth}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            You must be at least 13 years old
                        </p>
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
                            onClick={() => setShowPassword(!showPassword)}
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
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
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
                        disabled={
                            loading ||
                            usernameStatus.checking ||
                            usernameStatus.available === false
                        }
                        className="w-full bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white py-3 rounded-lg font-bold hover:bg-gradient-to-r hover:from-[#0072ff] hover:to-[#00c6ff] transition-colors disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
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
                </>
                )}
            </div>
        </div>
    );
};

export default SignUp;
