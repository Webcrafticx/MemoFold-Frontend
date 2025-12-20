import React, { useState, useEffect } from "react";
import { highlightMentionsAndHashtags } from "../../utils/highlightMentionsAndHashtags.jsx";
import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const EditProfileModal = ({
    isOpen,
    onClose,
    currentUsername,
    currentEmail,
    currentBio,
    isDarkMode,
    onSave,
    apiService,
    toast,
}) => {
    const [username, setUsername] = useState(currentUsername);
    const [email, setEmail] = useState(currentEmail);
    const [bio, setBio] = useState(currentBio || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // Background scroll lock effect
    useEffect(() => {
        if (isOpen) {
            // Store current scroll position
            const scrollY = window.scrollY;

            // Add styles to prevent scrolling
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.overflow = "hidden";

            return () => {
                // Restore scrolling when modal closes
                const scrollY = document.body.style.top;
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.left = "";
                document.body.style.right = "";
                document.body.style.overflow = "";
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            };
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setError("");

        if (!username.trim() || !email.trim()) {
            setError("Username and email are required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const result = await apiService.updateUserProfile(token, {
                username: username.trim(),
                email: email.trim(),
                description: bio.trim(), // Add bio/description to the API call
            });

            if (!result || result.success === false) {
                throw new Error(result?.message || "Failed to update profile");
            }

            if (onSave) {
                onSave(result);
            }

            // toast.success("Profile updated successfully!");
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
            setUsername(currentUsername);
            setEmail(currentEmail);
            setBio(currentBio || "");
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
                        className={`w-full max-w-md rounded-2xl shadow-2xl ${
                            isDarkMode
                                ? "bg-gray-800 text-gray-100"
                                : "bg-white text-gray-800"
                        }`}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
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
                                        placeholder="Enter username"
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && handleSubmit()
                                        }
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
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && handleSubmit()
                                        }
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
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            !e.shiftKey &&
                                            handleSubmit()
                                        }
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
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                                        loading
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
