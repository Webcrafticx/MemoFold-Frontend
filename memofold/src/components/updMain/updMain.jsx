// MainDashboard.jsx
import React, { useState } from "react";
import {
    FaBars,
    FaUserCircle,
    FaMoon,
    FaCommentDots,
    FaHome,
} from "react-icons/fa";

const MainDashboard = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [postContent, setPostContent] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [currentTime, setCurrentTime] = useState("--:--:--");

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const updateTime = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        setCurrentTime(timeString);
    };

    // Update time every second
    React.useEffect(() => {
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div
            className={`min-h-screen flex ${
                darkMode
                    ? "bg-gray-900 text-gray-100"
                    : "bg-gradient-to-r from-gray-100 to-gray-200"
            }`}
        >
            <div
                className={`flex-1 p-5 overflow-y-auto ${
                    darkMode ? "bg-gray-800" : "bg-transparent"
                }`}
            >
                {/* Topbar */}
                <div className="flex justify-end items-center gap-4 mb-3 flex-wrap">
                    {/* Settings Dropdown */}
                    <div className="relative">
                        <div className="dropdown">
                            <button
                                className={`p-2 text-lg rounded-full ${
                                    darkMode
                                        ? "bg-gray-700 text-gray-200"
                                        : "bg-gradient-to-br from-white to-gray-200 text-gray-600"
                                } shadow-md hover:scale-110 transition-transform`}
                            >
                                <FaBars />
                            </button>
                            <div
                                className={`absolute left-0 mt-2 w-56 rounded-lg shadow-xl z-10 ${
                                    darkMode ? "bg-gray-700" : "bg-white"
                                } hidden group-hover:block`}
                            >
                                <div className="p-2">
                                    <div className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                                        <FaUserCircle className="mr-3" />
                                        <span>Profile</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer">
                                        <div className="flex items-center">
                                            <FaMoon className="mr-3" />
                                            <span>Dark Mode</span>
                                        </div>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={darkMode}
                                                onChange={toggleDarkMode}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                                        <FaCommentDots className="mr-3" />
                                        <span>Feedback</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Home Button and Search */}
                    <div className="flex items-center gap-2">
                        <button
                            className={`p-2 rounded-full ${
                                darkMode
                                    ? "bg-gray-700 text-gray-200"
                                    : "bg-gradient-to-br from-white to-gray-200 text-gray-600"
                            } shadow-md hover:scale-110 transition-transform`}
                            title="Home"
                        >
                            <FaHome className="text-xl" />
                        </button>
                    </div>

                    {/* Calendar Picker */}
                    <input
                        type="date"
                        className={`px-3 py-1 rounded-lg ${
                            darkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-100 border-gray-300"
                        } border cursor-pointer`}
                        min="1950-01-01"
                        max="2025-12-31"
                        onChange={handleDateChange}
                    />

                    {/* Main Feed Icon */}
                    <a
                        href="/mainFeed"
                        className={`p-2 rounded-full ${
                            darkMode
                                ? "bg-gray-700 text-gray-200"
                                : "bg-gray-100 text-gray-600"
                        } shadow-sm hover:bg-gray-200`}
                        title="Main Feed"
                    >
                        📰
                    </a>
                </div>

                {/* Content Area */}
                <div className="max-w-2xl mx-auto mt-16">
                    {/* Post Box */}
                    <div
                        className={`p-4 rounded-xl ${
                            darkMode ? "bg-gray-700" : "bg-white"
                        } shadow-md mb-6`}
                    >
                        <textarea
                            className={`w-full p-4 rounded-lg mb-3 ${
                                darkMode
                                    ? "bg-gray-600 text-white border-gray-500"
                                    : "bg-white border-gray-300"
                            } border resize-y focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Write your post..."
                            rows="6"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                        ></textarea>

                        <div className="flex items-center gap-4 mb-4">
                            <button
                                className={`p-2 rounded-xl ${
                                    darkMode
                                        ? "bg-gray-600 text-red-400"
                                        : "bg-gray-100 text-red-500"
                                } shadow-md hover:scale-110 transition-transform`}
                                title="Like"
                            >
                                ❤️
                            </button>

                            {/* Comment Dropdown */}
                            <div className="relative">
                                <button
                                    className={`p-2 rounded-xl ${
                                        darkMode
                                            ? "bg-gray-600 text-gray-200"
                                            : "bg-gray-100 text-gray-600"
                                    } shadow-md hover:scale-110 transition-transform`}
                                >
                                    💬 Comment
                                </button>
                                <div
                                    className={`absolute left-0 mt-2 w-48 rounded-lg shadow-xl z-10 ${
                                        darkMode ? "bg-gray-700" : "bg-white"
                                    } hidden group-hover:block`}
                                >
                                    <div className="p-2">
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                                            Congrats 🎉
                                        </div>
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                                            Sorrow 😭
                                        </div>
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                                            LOL 😂
                                        </div>
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                                            Love ❤️
                                        </div>
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                                            Interesting 🤔
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                className={`p-2 rounded-xl ${
                                    darkMode
                                        ? "bg-gray-600 text-gray-200"
                                        : "bg-gray-100 text-gray-600"
                                } shadow-md hover:scale-110 transition-transform`}
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>

                        <button
                            className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-cyan-500 transition-all`}
                        >
                            Post
                        </button>
                        <div className="text-sm mt-2 text-gray-500">
                            {postContent.length} characters
                        </div>
                    </div>

                    {/* Date/Time Display */}
                    <div
                        className={`p-4 rounded-xl ${
                            darkMode ? "bg-gray-700" : "bg-white"
                        } shadow-md`}
                    >
                        <p className="mb-1">
                            Date: {selectedDate || "Not selected"}
                        </p>
                        <small className="text-gray-500">
                            Time: {currentTime}
                        </small>
                    </div>
                </div>
            </div>

            {/* Dark Mode Toggle Styles */}
            <style jsx>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 46px;
                    height: 24px;
                    margin-left: 10px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.4s;
                    border-radius: 34px;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }

                input:checked + .slider {
                    background-color: #007bff;
                }

                input:checked + .slider:before {
                    transform: translateX(22px);
                }
            `}</style>
        </div>
    );
};

export default MainDashboard;
