import React, { useState, useRef, useEffect } from "react";
import {
    FaCamera,
    FaEdit,
    FaCalendar,
    FaCog,
    FaUsers,
    FaUpload,
    FaEye,
    FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";
import EditProfileModal from "./EditProfileModal";

const ProfileHeader = ({
    profilePic,
    username,
    realName,
    email,
    bio,
    posts,
    stats,
    isDarkMode,
    joinedDate,
    onProfilePicUpdate,
    onBioUpdate,
    uploadingProfilePic,
    apiService,
    toast,
    onFriendsClick,
    onProfileUpdate,
}) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showCameraOptions, setShowCameraOptions] = useState(false);
    const [showProfileView, setShowProfileView] = useState(false);
    const profilePicInputRef = useRef(null);

    const handleProfileSave = (updatedData) => {
        if (onProfileUpdate) {
            onProfileUpdate(updatedData);
        }
    };

    const handleCameraClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowCameraOptions(!showCameraOptions);
    };

    const handleUploadProfile = () => {
        profilePicInputRef.current?.click();
        setShowCameraOptions(false);
    };

    const handleViewProfile = () => {
        setShowProfileView(true);
        setShowCameraOptions(false);
    };

    const handleProfilePicClick = () => {
        if (
            profilePic &&
            profilePic !==
                "https://ui-avatars.com/api/?name=User&background=random"
        ) {
            setShowProfileView(true);
        }
    };
    useEffect(() => {
        if (showProfileView) {
            // Disable background scroll
            document.body.style.overflow = "hidden";
        } else {
            // Restore scroll when closed
            document.body.style.overflow = "auto";
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showProfileView]);

    return (
        <>
            <div
                className={`max-w-4xl mx-auto mb-6 sm:mb-8 ${
                    isDarkMode
                        ? "bg-gray-800 border-gray-700 text-gray-100"
                        : "bg-white border-gray-200 text-gray-800"
                } border rounded-xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 transition-all hover:shadow-2xl cursor-default relative`}
            >
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                        isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    } cursor-pointer`}
                    aria-label="Edit profile"
                >
                    <FaCog className="text-lg" />
                </button>

                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="relative group self-center sm:self-auto">
                        <input
                            type="file"
                            id="profilePicUpload"
                            ref={profilePicInputRef}
                            onChange={(e) =>
                                onProfilePicUpdate(e.target.files[0])
                            }
                            className="hidden"
                            accept="image/*"
                        />

                        {/* Camera Options Dropdown - Smaller */}
                        {showCameraOptions && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className={`absolute bottom-12 right-0 z-50 min-w-40 rounded-lg shadow-xl border ${
                                    isDarkMode
                                        ? "bg-gray-800 border-gray-600 text-gray-100"
                                        : "bg-white border-gray-200 text-gray-800"
                                } p-1 space-y-0.5`}
                            >
                                <button
                                    onClick={handleUploadProfile}
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
                                        isDarkMode
                                            ? "hover:bg-gray-700 text-gray-100"
                                            : "hover:bg-gray-100 text-gray-800"
                                    } cursor-pointer`}
                                >
                                    <FaUpload className="text-blue-500 text-xs" />
                                    <span>Upload Profile</span>
                                </button>
                                <button
                                    onClick={handleViewProfile}
                                    disabled={
                                        !profilePic ||
                                        profilePic ===
                                            "https://ui-avatars.com/api/?name=User&background=random"
                                    }
                                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
                                        !profilePic ||
                                        profilePic ===
                                            "https://ui-avatars.com/api/?name=User&background=random"
                                            ? "opacity-50 cursor-not-allowed"
                                            : isDarkMode
                                            ? "hover:bg-gray-700 text-gray-100"
                                            : "hover:bg-gray-100 text-gray-800"
                                    } cursor-pointer`}
                                >
                                    <FaEye className="text-green-500 text-xs" />
                                    <span>View Profile</span>
                                </button>
                            </motion.div>
                        )}

                        {/* Profile Picture Container */}
                        <div className="relative">
                            <div
                                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 border-4 border-blue-400 shadow-lg cursor-pointer"
                                onClick={handleProfilePicClick}
                            >
                                {profilePic &&
                                profilePic !==
                                    "https://ui-avatars.com/api/?name=User&background=random" ? (
                                    <img
                                        src={profilePic}
                                        alt="Profile"
                                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                                            uploadingProfilePic
                                                ? "opacity-50"
                                                : ""
                                        }`}
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                                "flex";
                                        }}
                                    />
                                ) : null}
                                <span
                                    className="flex items-center justify-center w-full h-full text-white font-semibold text-4xl cursor-pointer"
                                    style={
                                        profilePic &&
                                        profilePic !==
                                            "https://ui-avatars.com/api/?name=User&background=random"
                                            ? { display: "none" }
                                            : {}
                                    }
                                >
                                    {username?.charAt(0).toUpperCase() || "U"}
                                </span>
                                {uploadingProfilePic && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                            </div>

                            {/* Camera Icon Button */}
                            <button
                                onClick={handleCameraClick}
                                className={`absolute bottom-2 right-2 p-2 rounded-full shadow-md transition-all ${
                                    isDarkMode
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                } cursor-pointer`}
                                aria-label="Profile picture options"
                            >
                                <FaCamera className="text-sm" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="text-center sm:text-left w-full">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-all cursor-default">
                                {realName}
                            </h2>
                            <p
                                className={`text-base sm:text-lg md:text-xl font-semibold mt-1 ${
                                    isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                } cursor-default`}
                            >
                                @{username}
                            </p>
                        </div>

                        {/* Bio section - simplified without inline editing */}
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex flex-row items-center w-full">
                                <p
                                    className={`text-center sm:text-left flex-1 ${
                                        isDarkMode
                                            ? "text-gray-300"
                                            : "text-gray-600"
                                    } cursor-default`}
                                >
                                    {bio || "No bio yet."}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 justify-center sm:justify-start">
                            <div
                                className={`flex items-center gap-1 sm:gap-2 ${
                                    isDarkMode
                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                } px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm sm:text-base`}
                            >
                                <div className="flex items-center">
                                    <FaCalendar className="mr-1" />
                                    <span>Joined {joinedDate}</span>
                                </div>
                            </div>
                            <div
                                className={`flex items-center gap-1 sm:gap-2 ${
                                    isDarkMode
                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                } px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm sm:text-base`}
                            >
                                <span className="text-blue-500">📊</span>
                                <span>
                                    {stats?.posts || posts.length} Posts
                                </span>
                            </div>
                            <div
                                onClick={onFriendsClick}
                                className={`flex items-center gap-1 cursor-pointer sm:gap-2 ${
                                    isDarkMode
                                        ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                } px-3 py-1.5 rounded-lg transition-all cursor-pointer text-sm sm:text-base`}
                            >
                                <FaUsers className="text-blue-500" />
                                <span>{stats?.friends || 0} Friends</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Picture View Modal */}
            {showProfileView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-transparent bg-opacity-80 p-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`relative max-w-2xl max-h-screen rounded-lg ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                        }`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowProfileView(false)}
                            className={`absolute -top-3 -right-3 z-10 p-2 rounded-full ${
                                isDarkMode
                                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                                    : "bg-white hover:bg-gray-100 text-gray-800"
                            } shadow-lg transition-colors cursor-pointer`}
                        >
                            <FaTimes className="text-lg" />
                        </button>

                        {/* Profile Image */}
                        <div className="p-2">
                            <img
                                src={profilePic}
                                alt="Profile Preview"
                                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            />
                        </div>

                        {/* User Info */}
                        <div
                            className={`p-4 border-t ${
                                isDarkMode
                                    ? "border-gray-700"
                                    : "border-gray-200"
                            }`}
                        >
                            <h3
                                className={`text-lg font-semibold ${
                                    isDarkMode ? "text-white" : "text-gray-800"
                                }`}
                            >
                                {realName}
                            </h3>
                            <p
                                className={`text-sm ${
                                    isDarkMode
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                }`}
                            >
                                @{username}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUsername={username}
                currentEmail={email || ""}
                currentBio={bio} // Pass current bio to modal
                isDarkMode={isDarkMode}
                onSave={handleProfileSave}
                apiService={apiService}
                toast={toast}
            />

            {/* Overlay to close camera options when clicking outside */}
            {showCameraOptions && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCameraOptions(false)}
                />
            )}
        </>
    );
};

export default ProfileHeader;
