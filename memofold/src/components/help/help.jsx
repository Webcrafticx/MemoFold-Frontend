import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";

const HelpPage = () => {
    const [sidebarActive, setSidebarActive] = useState(false);
    const [activeLink, setActiveLink] = useState("🧷 MemoFold Features");
    const [searchQuery, setSearchQuery] = useState("");
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? null : index);
    };

    const handleAuthAction = () => {
        if (token) {
            logout();
        } else {
            navigate("/login");
        }
    };

    const sidebarLinks = [
        {
            title: "🧷 MemoFold Features",
            tooltip:
                "Save memories with emotion-rich posts, time capsules, and curated Folds.",
            content: (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-600">
                        MemoFold Features
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                        MemoFold helps you preserve and organize your memories
                        in a meaningful way:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li>
                            <strong>Emotion-rich posts:</strong> Tag your
                            memories with emotions to easily find them later.
                        </li>
                        <li>
                            <strong>Time capsules:</strong> Save memories to be
                            revealed at a future date.
                        </li>
                        <li>
                            <strong>Folds:</strong> Organize related memories
                            into collections.
                        </li>
                        <li>
                            <strong>Privacy controls:</strong> Choose who can
                            see each memory.
                        </li>
                    </ul>
                </div>
            ),
        },
        {
            title: "👤 Your Profile",
            tooltip:
                "Showcase your life story through meaningful moments and shared posts.",
            content: (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-600">
                        Your Profile
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                        Your profile is your personal space to showcase your
                        memories:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li>
                            <strong>Profile picture:</strong> Upload an image
                            that represents you.
                        </li>
                        <li>
                            <strong>Bio:</strong> Tell others about yourself.
                        </li>
                        <li>
                            <strong>Memory timeline:</strong> View your posts in
                            chronological order.
                        </li>
                        <li>
                            <strong>Privacy settings:</strong> Control who can
                            see your profile.
                        </li>
                    </ul>
                </div>
            ),
        },
        {
            title: "➕ Sharing Photos and Videos",
            tooltip:
                "Post life moments with captions, emotions, tags, and privacy control.",
            content: (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-600">
                        Sharing Photos and Videos
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                        Share your memories with these easy steps:
                    </p>
                    <ol className="list-decimal pl-4 sm:pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li>Click the '+' button in the navigation bar</li>
                        <li>Select photos/videos from your device</li>
                        <li>Add a caption and select emotions</li>
                        <li>Choose privacy settings</li>
                        <li>Click "Post" to share</li>
                    </ol>
                </div>
            ),
        },
        {
            title: "🔍 Exploring Photos and Videos",
            tooltip:
                "Browse real stories and connect through shared emotions and Folds.",
            content: (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-600">
                        Exploring Content
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                        Discover memories shared by others:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li>
                            <strong>Search:</strong> Find specific memories by
                            keywords.
                        </li>
                        <li>
                            <strong>Filters:</strong> Narrow down by emotion,
                            date, or location.
                        </li>
                        <li>
                            <strong>Folds:</strong> Browse curated collections
                            of memories.
                        </li>
                        <li>
                            <strong>Explore tab:</strong> See popular and recent
                            posts.
                        </li>
                    </ul>
                </div>
            ),
        },
        {
            title: "💬 Messaging",
            tooltip:
                "Talk privately about memories with friends and heartfelt connections.",
            content: (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-600">
                        Messaging
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                        Connect privately with other users:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li>
                            <strong>Start conversations:</strong> Message any of
                            your connections.
                        </li>
                        <li>
                            <strong>Share memories:</strong> Send posts directly
                            in messages.
                        </li>
                        <li>
                            <strong>Group chats:</strong> Create groups to share
                            with multiple people.
                        </li>
                        <li>
                            <strong>Notifications:</strong> Get alerts for new
                            messages.
                        </li>
                    </ul>
                </div>
            ),
        },
        {
            title: "🧑‍🤝‍🧑 Finding Friends",
            tooltip:
                "Discover people with similar memory patterns and life experiences.",
            content: (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-600">
                        Finding Friends
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                        Build your network on MemoFold:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 space-y-2 text-gray-700 text-sm sm:text-base">
                        <li>
                            <strong>Search:</strong> Find people by username or
                            real name.
                        </li>
                        <li>
                            <strong>Suggestions:</strong> See recommendations
                            based on your interests.
                        </li>
                        <li>
                            <strong>Connections:</strong> View friends of
                            friends.
                        </li>
                        <li>
                            <strong>Import contacts:</strong> Find people from
                            your address book.
                        </li>
                    </ul>
                </div>
            ),
        },
    ];

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle search submission
        console.log("Search query:", searchQuery);
        // You can add actual search functionality here
    };

    const activeContent = sidebarLinks.find(
        (link) => link.title === activeLink
    )?.content;

    return (
        <div className="font-sans bg-gray-50 text-gray-800 leading-relaxed min-h-screen">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo Section */}
                        <Link
                            to="/"
                            className="flex items-center gap-3 group cursor-pointer"
                        >
                            <div className="relative">
                                <img
                                    src={logo}
                                    alt="MemoFold Logo"
                                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent leading-tight">
                                    MemoFold
                                </div>
                                <div className="text-xs text-gray-500 italic hidden sm:block">
                                    "Write your life before it fades."
                                </div>
                            </div>
                        </Link>

                        {/* Login Button */}
                        <button
                            onClick={handleAuthAction}
                            className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-600 text-white font-semibold py-2 px-4 sm:py-2.5 sm:px-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group text-sm sm:text-base"
                        >
                            <span>{token ? "Logout" : "Get Started"}</span>

                            <svg
                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5-5 5M6 12h12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Mobile Sidebar Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-xl z-40 hover:bg-blue-700 transition-all duration-300 cursor-pointer"
                >
                    {sidebarActive ? "✕" : "☰"}
                </button>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Sidebar */}
                    <aside
                        className={`bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:w-72 lg:sticky lg:top-24 lg:h-fit z-30 transform ${
                            sidebarActive
                                ? "translate-x-0"
                                : "-translate-x-full"
                        } lg:translate-x-0 fixed lg:static inset-0 transition-transform duration-300 ease-in-out`}
                    >
                        <div className="lg:hidden flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-blue-600">
                                Help Topics
                            </h2>
                            <button
                                onClick={toggleSidebar}
                                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <nav className="space-y-2">
                            {sidebarLinks.map((link, index) => (
                                <div key={index} className="group relative">
                                    <button
                                        onClick={() => {
                                            setActiveLink(link.title);
                                            if (window.innerWidth < 1024) {
                                                setSidebarActive(false);
                                            }
                                        }}
                                        className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 cursor-pointer text-sm sm:text-base ${
                                            activeLink === link.title
                                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                                : "hover:bg-gray-50 hover:text-blue-600 border border-transparent"
                                        }`}
                                    >
                                        {link.title}
                                    </button>
                                    <div className="hidden lg:group-hover:block absolute left-full top-0 ml-2 w-64 bg-white p-4 rounded-lg shadow-xl z-50 border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            {link.tooltip}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Overlay for mobile sidebar */}
                    {sidebarActive && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden cursor-pointer"
                            onClick={toggleSidebar}
                        />
                    )}

                    {/* Main Content */}
                    <main className="flex-1 bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="text-center mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-3 sm:mb-4">
                                💬 Help Center
                            </h1>
                            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                                Find answers to your questions and learn how to
                                make the most of MemoFold
                            </p>
                        </div>

                        {/* Search Section */}
                        <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
                            <div className="flex items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-300">
                                <span className="text-gray-500 mr-2 cursor-pointer">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Ask me anything about MemoFold..."
                                    className="flex-1 outline-none text-sm sm:text-base cursor-text bg-transparent"
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-6 sm:px-8 rounded-full shadow-lg hover:from-cyan-500 hover:to-blue-600 hover:shadow-xl transition-all duration-300 cursor-pointer text-sm sm:text-base"
                            >
                                Search Help Articles
                            </button>
                        </form>

                        {/* Content Section */}
                        <section className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    {activeLink.replace(/^[^\w\s]+\s/, "")}
                                </h2>
                            </div>

                            <div className="prose max-w-none">
                                {activeContent}
                            </div>

                            {/* Related Articles */}
                            <div className="bg-blue-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-blue-200 mt-8">
                                <h3 className="font-semibold text-blue-700 mb-3 sm:mb-4 text-lg">
                                    Related Articles
                                </h3>
                                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                    <li>
                                        <Link
                                            to="#"
                                            className="text-blue-600 hover:underline cursor-pointer block py-1"
                                        >
                                            How to create your first memory
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="text-blue-600 hover:underline cursor-pointer block py-1"
                                        >
                                            Privacy settings explained
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="text-blue-600 hover:underline cursor-pointer block py-1"
                                        >
                                            Troubleshooting common issues
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="#"
                                            className="text-blue-600 hover:underline cursor-pointer block py-1"
                                        >
                                            Managing your account settings
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact Support */}
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 mt-6">
                                <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-lg">
                                    Still need help?
                                </h3>
                                <p className="text-gray-600 text-sm sm:text-base mb-3">
                                    Our support team is here to assist you.
                                </p>
                                <a
                                    href="mailto:support@memofold.com"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer text-sm sm:text-base"
                                >
                                    <span>✉️</span>
                                    Contact Support
                                </a>
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 sm:py-6 mt-8 sm:mt-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-3 sm:gap-4">
                        <div className="text-gray-600 text-xs sm:text-sm text-center">
                            © Copyright 2025 MemoFold | All Rights Reserved
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HelpPage;
