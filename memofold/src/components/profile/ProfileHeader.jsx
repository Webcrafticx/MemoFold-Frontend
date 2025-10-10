import React, { useState, useRef } from "react";
import { FaCamera, FaEdit, FaCalendar, FaCog, FaUsers } from "react-icons/fa";
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
    const profilePicInputRef = useRef(null);

    const handleProfileSave = (updatedData) => {
        if (onProfileUpdate) {
            onProfileUpdate(updatedData);
        }
    };

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
                        <label
                            htmlFor="profilePicUpload"
                            className="cursor-pointer block"
                        >
                            <div className="relative">
                                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 border-4 border-blue-400 shadow-lg cursor-pointer">
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
                                        {username?.charAt(0).toUpperCase() ||
                                            "U"}
                                    </span>
                                    {uploadingProfilePic && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full group-hover:bg-blue-600 transition-colors shadow-md cursor-pointer">
                                        <FaCamera className="text-sm" />
                                    </div>
                                </div>
                            </div>
                        </label>
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
        </>
    );
};

export default ProfileHeader;
