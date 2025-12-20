import React, { useRef, useState, useEffect } from "react";
import { FaPaperclip, FaTimes, FaSpinner } from "react-icons/fa";
import {
    getIndianDateString,
    getSelectedDateUTC,
} from "../../services/dateUtils";
import {
    compressImage,
    compressVideo,
    shouldCompressFile,
    getFileType,
    checkVideoDuration
} from "../../utils/fileCompression";
import { highlightMentionsAndHashtags } from "../../utils/highlightMentionsAndHashtags.jsx";

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
    const textareaRef = useRef(null);

    const [filePreview, setFilePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);

    // Custom notification state
    const [notification, setNotification] = useState({ message: '', visible: false });
    const notificationTimeoutRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const type = getFileType(file);
        if (type !== 'image' && type !== 'video') {
            setNotification({ message: "Please select an image or video file", visible: true });
            clearTimeout(notificationTimeoutRef.current);
            notificationTimeoutRef.current = setTimeout(() => {
                setNotification({ message: '', visible: false });
            }, 6000);
            return;
        }

        try {
            setFileType(type);

            // Validate video duration
            if (type === 'video') {
                const duration = await checkVideoDuration(file);
                if (duration > 15) {
                    setNotification({ message: "Video must be 15 seconds or less", visible: true });
                    clearTimeout(notificationTimeoutRef.current);
                    notificationTimeoutRef.current = setTimeout(() => {
                        setNotification({ message: '', visible: false });
                    }, 6000);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    setFileType(null);
                    return;
                }
            }

            let processedFile = file;
            // Check if compression is needed
            if (shouldCompressFile(file)) {
                setIsCompressing(true);
                setCompressionProgress(0);

                try {
                    if (type === 'image') {
                        processedFile = await compressImage(file, (progress) => {
                            setCompressionProgress(progress);
                        });
                    } else if (type === 'video') {
                        processedFile = await compressVideo(file, (progress) => {
                            setCompressionProgress(progress);
                        });
                    }
                } finally {
                    setTimeout(() => {
                        setIsCompressing(false);
                        setCompressionProgress(0);
                    }, 500);
                }
            }

            setSelectedFile(processedFile);

            // Create preview
            if (type === 'image') {
                const reader = new FileReader();
                reader.onload = (event) => setFilePreview(event.target.result);
                reader.readAsDataURL(processedFile);
            } else if (type === 'video') {
                setFilePreview(URL.createObjectURL(processedFile));
            }

        } catch (error) {
            console.error('File processing error:', error);
            setNotification({ message: 'Error processing file. Please try again.', visible: true });
            clearTimeout(notificationTimeoutRef.current);
            notificationTimeoutRef.current = setTimeout(() => {
                setNotification({ message: '', visible: false });
            }, 3000);
            removeFile();
        }
    };
    // Cleanup notification timeout on unmount
    useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setFileType(null);
        setIsCompressing(false);
        setCompressionProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePostSubmit = async () => {
        if ((!postContent.trim() && !filePreview) || isCreatingPost || isCompressing) {
            return;
        }

        const postTimestamp = getSelectedDateUTC(selectedDate);
        await onCreatePost(postContent, selectedFile, postTimestamp, fileType);
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
            {/* Custom Notification */}
            {notification.visible && (
                <div className={`flex items-center justify-between mb-3 p-3 rounded-lg border ${isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-400 text-red-800'} transition-all`}>
                    <span className="text-sm font-medium select-none">{notification.message}</span>
                    <button
                        onClick={() => setNotification({ message: '', visible: false })}
                        className={`ml-4 p-1 rounded-full ${isDarkMode ? 'hover:bg-red-800' : 'hover:bg-red-200'} focus:outline-none cursor-pointer`}
                        title="Close"
                    >
                        <FaTimes size={16} className="cursor-pointer" />
                    </button>
                </div>
            )}
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
                ref={textareaRef}
                value={postContent}
                onChange={(e) => {
                    setPostContent(e.target.value);
                    const textarea = textareaRef.current;
                    if (!textarea) return;
                    textarea.style.height = "auto";
                    textarea.style.height = textarea.scrollHeight + "px";
                }}
                placeholder="What's on your mind?"
                rows={3}
                className={`w-full p-4 rounded-lg mb-1 resize-none max-h-96 overflow-y-auto ${
                    isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400"
                        : "bg-gray-100 text-gray-800 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base cursor-text`}
            />

            {isCompressing && ( 
                <div className={`mb-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <FaSpinner className="animate-spin" />
                        <span className="text-sm">
                            {fileType === 'video' ? 'Processing video...' : 'Processing image...'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${compressionProgress}%` }}
                        ></div>
                    </div>
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                        Progress: {compressionProgress}%
                    </div>
                </div>
            )}

            {filePreview && !isCompressing && (
                <div className="relative mb-3">
                    {fileType === "image" ? (
                        <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full max-h-96 object-contain rounded-lg cursor-pointer bg-gray-100"
                        />
                    ) : fileType === "video" ? (
                        <div className="relative">
                            <video
                                src={filePreview}
                                className="w-full max-h-96 object-contain rounded-lg cursor-pointer bg-gray-100"
                                controls
                                preload="metadata"
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                VIDEO
                            </div>
                        </div>
                    ) : null}
                    <button
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 cursor-pointer"
                        title="Remove file"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            max={getIndianDateString()}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className={`${
                                isDarkMode
                                    ? "bg-gray-700 text-white border-gray-600"
                                    : "bg-gray-100 text-gray-800 border-gray-300"
                            } p-1 sm:p-2 rounded border cursor-pointer text-xs sm:text-sm`}
                        />
                        {selectedDate &&
                            selectedDate !== getIndianDateString() && (
                                <span className="text-xs text-blue-500 cursor-default">
                                    Posting for:{" "}
                                    {new Date(
                                        selectedDate
                                    ).toLocaleDateString('en-IN')}
                                </span>
                            )}
                    </div>
                </div>

                <div className="flex gap-1 sm:gap-2 self-end items-center">
                    <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={isCompressing}
                        className={`p-2 sm:p-3 flex items-center gap-1 rounded-lg ${
                            isCompressing 
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                        }`}
                        title={isCompressing ? "Processing..." : "Attach file"}
                    >
                        <FaPaperclip className="text-sm sm:text-base" />
                        <span className="text-xs sm:text-sm">
                            {isCompressing ? "Processing..." : "Add Media"}
                        </span>
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*"
                        disabled={isCompressing}
                    />

                    <button
                        onClick={handlePostSubmit}
                        disabled={
                            (!postContent.trim() && !filePreview) ||
                            isCreatingPost ||
                            isCompressing
                        }
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base ${
                            (postContent.trim() || filePreview) &&
                            !isCreatingPost &&
                            !isCompressing
                                ? "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer shadow-sm"
                                : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                        } transition-colors`}
                    >
                        {isCreatingPost ? "Posting..." : 
                         isCompressing ? "Processing..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostSection;