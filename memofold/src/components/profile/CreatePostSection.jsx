import React, { useRef, useState, useEffect } from "react";
import { FaPaperclip, FaTimes, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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
import { MAX_MEDIA_ITEMS, MAX_VIDEO_DURATION_SEC } from "../../utils/mediaLimits";
import MentionInput from "../common/MentionInput";
import LocationAutocomplete from "../common/LocationAutocomplete";

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

    const [mediaItems, setMediaItems] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [compressionLabel, setCompressionLabel] = useState("");
    const [location, setLocation] = useState(null);
    const [visibility, setVisibility] = useState("public");

    const [notification, setNotification] = useState({ message: '', visible: false });
    const notificationTimeoutRef = useRef(null);

    const showNotification = (message, ms = 6000) => {
        setNotification({ message, visible: true });
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = setTimeout(() => {
            setNotification({ message: '', visible: false });
        }, ms);
    };

    const revokePreview = (item) => {
        if (item?.previewUrl && item.type === "video" && item.previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(item.previewUrl);
        }
    };

    const createPreviewUrl = (file, type) => {
        if (type === "video") return URL.createObjectURL(file);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const processFile = async (file) => {
        const type = getFileType(file);
        if (type !== "image" && type !== "video") {
            return { error: "Please select an image or video file" };
        }

        if (type === "video") {
            const duration = await checkVideoDuration(file);
            if (Math.floor(duration) > MAX_VIDEO_DURATION_SEC) {
                return { error: `Video must be ${MAX_VIDEO_DURATION_SEC} seconds or less` };
            }
        }

        let processedFile = file;
        if (shouldCompressFile(file)) {
            if (type === "image") {
                processedFile = await compressImage(file, (progress) => {
                    setCompressionProgress(progress);
                });
            } else {
                processedFile = await compressVideo(file, (progress) => {
                    setCompressionProgress(progress);
                });
            }
        }

        const previewUrl = await createPreviewUrl(processedFile, type);
        return {
            item: {
                id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                file: processedFile,
                type,
                previewUrl
            }
        };
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (files.length === 0) return;

        const remaining = MAX_MEDIA_ITEMS - mediaItems.length;
        if (remaining <= 0) {
            showNotification(`Maximum ${MAX_MEDIA_ITEMS} media files allowed`);
            return;
        }

        const toProcess = files.slice(0, remaining);
        if (files.length > remaining) {
            showNotification(`Only ${remaining} more media file(s) can be added (max ${MAX_MEDIA_ITEMS})`);
        }

        setIsCompressing(true);
        setCompressionProgress(0);

        try {
            const added = [];
            for (let i = 0; i < toProcess.length; i++) {
                setCompressionLabel(`Processing ${i + 1}/${toProcess.length}...`);
                setCompressionProgress(0);
                const result = await processFile(toProcess[i]);
                if (result.error) {
                    showNotification(result.error);
                    continue;
                }
                added.push(result.item);
            }

            if (added.length > 0) {
                setMediaItems((prev) => {
                    const next = [...prev, ...added];
                    setActiveIndex(prev.length);
                    return next;
                });
            }
        } catch (error) {
            console.error("File processing error:", error);
            showNotification("Error processing file. Please try again.", 3000);
        } finally {
            setTimeout(() => {
                setIsCompressing(false);
                setCompressionProgress(0);
                setCompressionLabel("");
            }, 300);
        }
    };

    useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
            mediaItems.forEach(revokePreview);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeMediaAt = (index) => {
        setMediaItems((prev) => {
            const victim = prev[index];
            revokePreview(victim);
            const next = prev.filter((_, i) => i !== index);
            setActiveIndex((ai) => {
                if (next.length === 0) return 0;
                if (ai >= next.length) return next.length - 1;
                if (ai > index) return ai - 1;
                return ai;
            });
            return next;
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const clearAllMedia = () => {
        setMediaItems((prev) => {
            prev.forEach(revokePreview);
            return [];
        });
        setActiveIndex(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePostSubmit = async () => {
        if ((!postContent.trim() && mediaItems.length === 0) || isCreatingPost || isCompressing) {
            return;
        }

        const postTimestamp = getSelectedDateUTC(selectedDate);
        await onCreatePost(postContent, mediaItems, postTimestamp, location, visibility);
        setPostContent("");
        clearAllMedia();
        setLocation(null);
        setVisibility("public");
        setSelectedDate(getIndianDateString());
    };

    const activeItem = mediaItems[activeIndex] || null;

    return (
        <div
            className={`max-w-2xl mx-auto mb-6 sm:mb-8 ${
                isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-200 text-gray-800"
            } border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md cursor-default`}
        >
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


            <MentionInput
                inputRef={textareaRef}
                value={postContent}
                onChange={(next) => {
                    setPostContent(next);
                    const textarea = textareaRef.current;
                    if (!textarea) return;
                    textarea.style.height = "auto";
                    textarea.style.height = textarea.scrollHeight + "px";
                }}
                placeholder="What's on your mind? Use @ to mention friends"
                rows={3}
                className={`w-full p-4 rounded-lg mb-1 resize-none max-h-96 overflow-y-auto ${
                    isDarkMode
                        ? "bg-gray-700 text-white placeholder-gray-400"
                        : "bg-gray-100 text-gray-800 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base cursor-text`}
            />

            <div className="mb-3">
                <LocationAutocomplete
                    value={location}
                    onChange={setLocation}
                    isDarkMode={isDarkMode}
                    disabled={isCreatingPost || isCompressing}
                    placeholder="Search for a location"
                />
            </div>

            <div className="mb-3 flex items-center gap-2">
                <span
                    className={`text-xs sm:text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                    Who can see
                </span>
                <div
                    className={`inline-flex rounded-lg border overflow-hidden text-xs sm:text-sm ${
                        isDarkMode ? "border-gray-600" : "border-gray-300"
                    }`}
                >
                    <button
                        type="button"
                        onClick={() => setVisibility("public")}
                        disabled={isCreatingPost || isCompressing}
                        className={`px-3 py-1.5 cursor-pointer transition-colors ${
                            visibility === "public"
                                ? "bg-blue-500 text-white"
                                : isDarkMode
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Public
                    </button>
                    <button
                        type="button"
                        onClick={() => setVisibility("friends")}
                        disabled={isCreatingPost || isCompressing}
                        className={`px-3 py-1.5 cursor-pointer transition-colors ${
                            visibility === "friends"
                                ? "bg-blue-500 text-white"
                                : isDarkMode
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Friends only
                    </button>
                </div>
            </div>

            {isCompressing && (
                <div className={`mb-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <FaSpinner className="animate-spin" />
                        <span className="text-sm">
                            {compressionLabel || "Processing media..."}
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

            {mediaItems.length > 0 && !isCompressing && activeItem && (
                <div className="mb-3">
                    <div className="relative">
                        {activeItem.type === "image" ? (
                            <img
                                src={activeItem.previewUrl}
                                alt="Preview"
                                className="w-full max-h-96 object-contain rounded-lg bg-gray-100"
                            />
                        ) : (
                            <video
                                src={activeItem.previewUrl}
                                className="w-full max-h-96 object-contain rounded-lg bg-gray-100"
                                controls
                                preload="metadata"
                            />
                        )}

                        {mediaItems.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setActiveIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 cursor-pointer"
                                    aria-label="Previous"
                                >
                                    <FaChevronLeft size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveIndex((i) => (i + 1) % mediaItems.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 cursor-pointer"
                                    aria-label="Next"
                                >
                                    <FaChevronRight size={14} />
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() => removeMediaAt(activeIndex)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 cursor-pointer"
                            title="Remove"
                        >
                            <FaTimes size={14} />
                        </button>

                        {mediaItems.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                                {activeIndex + 1}/{mediaItems.length}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                        {mediaItems.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`relative flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 cursor-pointer ${
                                    index === activeIndex
                                        ? "border-blue-500"
                                        : isDarkMode
                                          ? "border-gray-600"
                                          : "border-gray-300"
                                }`}
                            >
                                {item.type === "image" ? (
                                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <video src={item.previewUrl} className="w-full h-full object-cover" muted preload="metadata" />
                                )}
                            </button>
                        ))}
                    </div>
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
                        disabled={isCompressing || mediaItems.length >= MAX_MEDIA_ITEMS}
                        className={`p-2 sm:p-3 flex items-center gap-1 rounded-lg ${
                            isCompressing || mediaItems.length >= MAX_MEDIA_ITEMS
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                        }`}
                        title={mediaItems.length >= MAX_MEDIA_ITEMS ? `Max ${MAX_MEDIA_ITEMS} media` : "Attach files"}
                    >
                        <FaPaperclip className="text-sm sm:text-base" />
                        <span className="text-xs sm:text-sm">
                            {isCompressing
                                ? "Processing..."
                                : mediaItems.length > 0
                                  ? `Add Media (${mediaItems.length}/${MAX_MEDIA_ITEMS})`
                                  : "Add Media"}
                        </span>
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,.dng,.heic,.heif,video/*"
                        multiple
                        disabled={isCompressing || mediaItems.length >= MAX_MEDIA_ITEMS}
                    />

                    <button
                        onClick={handlePostSubmit}
                        disabled={
                            (!postContent.trim() && mediaItems.length === 0) ||
                            isCreatingPost ||
                            isCompressing
                        }
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base ${
                            (postContent.trim() || mediaItems.length > 0) &&
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
