import React, { useRef, useState } from "react";
import { FaPaperclip, FaTimes } from "react-icons/fa";
import {
    getIndianDateString,
    getCurrentIndianTimeISO,
} from "../../services/dateUtils";

const CreatePostSection = ({
    profilePic,
    username,
    realName,
    postContent,
    setPostContent,
    isDarkMode,
    selectedDate,
    setSelectedDate,
    onCreatePost,
    isCreatingPost,
    navigateToUserProfile,
    currentUserProfile,
}) => {
    const fileInputRef = useRef(null);
    const [filePreview, setFilePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (
            !validTypes.includes(file.type) &&
            !file.type.startsWith("image/")
        ) {
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => setFilePreview(event.target.result);
        reader.readAsDataURL(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePostSubmit = async () => {
        // YEH LINE CHANGE KAREN - selectedDate use karen
        await onCreatePost(postContent, selectedFile, selectedDate);
        setPostContent("");
        removeFile();
        setSelectedDate(getIndianDateString());
    };

    return (
        <div
            className={`max-w-2xl mx-auto mb-6 sm:mb-8 ${
                isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-800"
            } border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md cursor-default`}
        >
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-400 cursor-pointer">
                    {profilePic &&
                    profilePic !==
                        "https://ui-avatars.com/api/?name=User&background=random" ? (
                        <img
                            src={profilePic}
                            alt={username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                            }}
                            onClick={() =>
                                navigateToUserProfile(currentUserProfile?._id)
                            }
                        />
                    ) : null}
                    <span
                        className="flex items-center justify-center w-full h-full text-white font-semibold text-lg"
                        style={
                            profilePic &&
                            profilePic !==
                                "https://ui-avatars.com/api/?name=User&background=random"
                                ? { display: "none" }
                                : {}
                        }
                        onClick={() =>
                            navigateToUserProfile(currentUserProfile?._id)
                        }
                    >
                        {username?.charAt(0).toUpperCase() || "U"}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span
                        className="font-semibold cursor-pointer hover:text-blue-500 text-sm sm:text-base"
                        onClick={() =>
                            navigateToUserProfile(currentUserProfile?._id)
                        }
                    >
                        {realName || username}
                    </span>
                    <span
                        className={`text-xs cursor-pointer hover:text-blue-500 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                        onClick={() =>
                            navigateToUserProfile(currentUserProfile?._id)
                        }
                    >
                        @{username}
                    </span>
                </div>
            </div>

            <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className={`w-full p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 ${
                    isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400"
                        : "bg-gray-100 text-gray-800 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base cursor-text`}
                rows="3"
            ></textarea>

            {filePreview && (
                <div className="relative mb-3">
                    <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                    />
                    <button
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={`${
                                isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-gray-100 text-gray-800 border-gray-300"
                            } p-1 rounded border cursor-pointer text-xs sm:text-sm`}
                        />
                        {selectedDate &&
                            selectedDate !== getIndianDateString() && (
                                <span className="text-xs text-blue-500 cursor-default">
                                    Posting for:{" "}
                                    {new Date(
                                        selectedDate
                                    ).toLocaleDateString()}
                                </span>
                            )}
                    </div>
                </div>

                <div className="flex gap-1 sm:gap-2 self-end">
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                        title="Attach file"
                    >
                        <FaPaperclip className="text-xs sm:text-sm" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    <button
                        onClick={handlePostSubmit}
                        disabled={
                            (!postContent.trim() && !filePreview) ||
                            isCreatingPost
                        }
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium ${
                            (postContent.trim() || filePreview) &&
                            !isCreatingPost
                                ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                                : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                        } transition-colors`}
                    >
                        {isCreatingPost ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostSection;
