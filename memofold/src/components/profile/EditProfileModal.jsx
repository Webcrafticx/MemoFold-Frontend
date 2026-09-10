import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
    USERNAME_DEBOUNCE_MS,
    validateUsernameLocal,
    fetchUsernameAvailability,
} from "../../utils/usernameAvailability";

const toDateInputValue = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
};

const getMaxDob = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().slice(0, 10);
};

const EditProfileModal = ({
    isOpen,
    onClose,
    currentUsername,
    currentRealName,
    currentEmail,
    currentBio,
    currentDateOfBirth,
    isDarkMode,
    onSave,
    apiService,
}) => {
    const [realname, setRealname] = useState(currentRealName || "");
    const [username, setUsername] = useState(currentUsername || "");
    const [email, setEmail] = useState(currentEmail || "");
    const [bio, setBio] = useState(currentBio || "");
    const [dateOfBirth, setDateOfBirth] = useState(
        toDateInputValue(currentDateOfBirth)
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [usernameStatus, setUsernameStatus] = useState({
        checking: false,
        available: null,
        message: "",
    });
    const usernameDebounceRef = useRef(null);
    const usernameAbortRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setRealname(currentRealName || "");
            setUsername(currentUsername || "");
            setEmail(currentEmail || "");
            setBio(currentBio || "");
            setDateOfBirth(toDateInputValue(currentDateOfBirth));
            setError("");
            setUsernameStatus({ checking: false, available: true, message: "" });
        }
    }, [
        isOpen,
        currentUsername,
        currentRealName,
        currentEmail,
        currentBio,
        currentDateOfBirth,
    ]);

    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.overflow = "hidden";

            return () => {
                const top = document.body.style.top;
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.left = "";
                document.body.style.right = "";
                document.body.style.overflow = "";
                window.scrollTo(0, parseInt(top || "0", 10) * -1);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
            if (usernameAbortRef.current) usernameAbortRef.current.abort();
        };
    }, []);

    const checkUsernameAvailability = (value) => {
        clearTimeout(usernameDebounceRef.current);
        if (usernameAbortRef.current) usernameAbortRef.current.abort();

        const local = validateUsernameLocal(value);
        const current = (currentUsername || "").toLowerCase();

        if (!local.value || local.value === current) {
            setUsernameStatus({
                checking: false,
                available: true,
                message: "",
            });
            return;
        }

        if (!local.ok) {
            setUsernameStatus({
                checking: false,
                available: false,
                message: local.message,
            });
            return;
        }

        setUsernameStatus({
            checking: false,
            available: null,
            message: "",
        });

        usernameDebounceRef.current = setTimeout(async () => {
            const controller = new AbortController();
            usernameAbortRef.current = controller;
            setUsernameStatus({
                checking: true,
                available: null,
                message: "Checking availability...",
            });
            try {
                const token = localStorage.getItem("token");
                const data = await fetchUsernameAvailability(local.value, {
                    token,
                    signal: controller.signal,
                });
                if (controller.signal.aborted) return;
                setUsernameStatus({
                    checking: false,
                    available: !!data.available,
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

    const handleUsernameChange = (value) => {
        setUsername(value);
        checkUsernameAvailability(value);
    };

    const handleSubmit = async () => {
        setError("");

        if (!realname.trim() || !username.trim() || !email.trim()) {
            setError("Full name, username, and email are required");
            return;
        }

        if (realname.trim().length < 2) {
            setError("Full name must be at least 2 characters");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        const local = validateUsernameLocal(username);
        const current = (currentUsername || "").toLowerCase();
        if (!local.ok) {
            setError(local.message || "Invalid username");
            return;
        }

        if (local.value !== current) {
            if (usernameStatus.checking) {
                setError("Please wait while we check username availability");
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const data = await fetchUsernameAvailability(local.value, { token });
                if (!data.available) {
                    setUsernameStatus({
                        checking: false,
                        available: false,
                        message: data.message,
                    });
                    setError(data.message || "Username is not available");
                    return;
                }
            } catch {
                setError("Could not verify username availability");
                return;
            }
        }

        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const minAgeDate = new Date();
            minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
            if (dob > new Date()) {
                setError("Date of birth cannot be in the future");
                return;
            }
            if (dob > minAgeDate) {
                setError("You must be at least 13 years old");
                return;
            }
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const payload = {
                realname: realname.trim(),
                username: local.value,
                email: email.trim(),
                description: bio.trim(),
            };
            if (dateOfBirth) {
                payload.dateOfBirth = dateOfBirth;
            }

            const result = await apiService.updateUserProfile(token, payload);

            if (!result || result.success === false) {
                throw new Error(result?.message || "Failed to update profile");
            }

            if (onSave) {
                onSave({
                    username: result.user?.username || local.value,
                    realname: result.user?.realname || realname.trim(),
                    email: result.user?.email || email.trim(),
                    description:
                        result.profile?.description ?? bio.trim(),
                    dateOfBirth:
                        result.user?.dateOfBirth || dateOfBirth || null,
                    user: result.user,
                    profile: result.profile,
                });
            }

            onClose();
        } catch (err) {
            setError(
                err.message || "Failed to update profile. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setError("");
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50 p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
                            isDarkMode
                                ? "bg-gray-800 text-gray-100"
                                : "bg-white text-gray-800"
                        }`}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
                            <h2 className="text-2xl font-bold">Edit Profile</h2>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className={`p-2 rounded-full transition-colors ${
                                    loading
                                        ? "cursor-not-allowed opacity-50"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                }`}
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={realname}
                                        onChange={(e) =>
                                            setRealname(e.target.value)
                                        }
                                        disabled={loading}
                                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-gray-50 border-gray-300 text-gray-800"
                                        } ${
                                            loading
                                                ? "cursor-not-allowed opacity-50"
                                                : "cursor-text"
                                        }`}
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) =>
                                            handleUsernameChange(e.target.value)
                                        }
                                        disabled={loading}
                                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-gray-50 border-gray-300 text-gray-800"
                                        } ${
                                            usernameStatus.available === false
                                                ? "border-red-500"
                                                : usernameStatus.available ===
                                                    true
                                                  ? "border-green-500"
                                                  : ""
                                        } ${
                                            loading
                                                ? "cursor-not-allowed opacity-50"
                                                : "cursor-text"
                                        }`}
                                        placeholder="Enter username"
                                        autoComplete="off"
                                    />
                                    {usernameStatus.message && (
                                        <p
                                            className={`mt-1 text-xs ${
                                                usernameStatus.available === true
                                                    ? "text-green-500"
                                                    : usernameStatus.available ===
                                                        false
                                                      ? "text-red-500"
                                                      : isDarkMode
                                                        ? "text-gray-400"
                                                        : "text-gray-500"
                                            }`}
                                        >
                                            {usernameStatus.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) =>
                                            setDateOfBirth(e.target.value)
                                        }
                                        disabled={loading}
                                        max={getMaxDob()}
                                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-gray-50 border-gray-300 text-gray-800"
                                        } ${
                                            loading
                                                ? "cursor-not-allowed opacity-50"
                                                : "cursor-text"
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        disabled={loading}
                                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-gray-50 border-gray-300 text-gray-800"
                                        } ${
                                            loading
                                                ? "cursor-not-allowed opacity-50"
                                                : "cursor-text"
                                        }`}
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        disabled={loading}
                                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                                            isDarkMode
                                                ? "bg-gray-700 border-gray-600 text-white"
                                                : "bg-gray-50 border-gray-300 text-gray-800"
                                        } ${
                                            loading
                                                ? "cursor-not-allowed opacity-50"
                                                : "cursor-text"
                                        }`}
                                        placeholder="Tell us about yourself..."
                                        rows="3"
                                        maxLength="200"
                                    />
                                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {bio.length}/200
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        loading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gray-300 text-white hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={
                                        loading ||
                                        usernameStatus.checking ||
                                        usernameStatus.available === false
                                    }
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                                        loading ||
                                        usernameStatus.checking ||
                                        usernameStatus.available === false
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                    }`}
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditProfileModal;
