import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";

const HelpPage = () => {
    const [sidebarActive, setSidebarActive] = useState(false);
    const [activeLink, setActiveLink] = useState("MemoFold Features");
    const [searchQuery, setSearchQuery] = useState("");
    const { token, username, logout } = useAuth();
    const navigate = useNavigate();

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
                    <p className="text-gray-700">
                        MemoFold helps you preserve and organize your memories
                        in a meaningful way:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
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
                    <p className="text-gray-700">
                        Your profile is your personal space to showcase your
                        memories:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
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
                    <p className="text-gray-700">
                        Share your memories with these easy steps:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
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
                    <p className="text-gray-700">
                        Discover memories shared by others:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
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
                    <p className="text-gray-700">
                        Connect privately with other users:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
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
                    <p className="text-gray-700">
                        Build your network on MemoFold:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
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

    const handleLoginClick = () => {
        if (token) {
            navigate("/profile");
        } else {
            navigate("/login");
        }
    };

    const activeContent = sidebarLinks.find(
        (link) => link.title === activeLink
    )?.content;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Bar */}
            <header className="bg-white shadow-sm py-4 px-6 md:px-8 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <a
                    href="mailto:memofold@gmail.com"
                    className="text-blue-600 font-medium hover:underline text-sm md:text-base cursor-pointer"
                >
                    Email Us
                </a>

                <div className="w-full md:w-auto flex justify-end">
                    <button
                        onClick={handleLoginClick}
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-500 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                    >
                        <img
                            src={logo}
                            alt="User"
                            className="w-7 h-7 rounded-full object-cover shadow-sm cursor-pointer"
                        />
                        {token ? "My Profile" : "Log in"}
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-xl z-40 hover:bg-blue-700 transition-all duration-300 cursor-pointer"
            >
                {sidebarActive ? "✕" : "☰"}
            </button>

            {/* Main Container */}
            <div className="flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside
                    className={`fixed md:static inset-0 bg-white border-r border-gray-200 w-64 md:w-72 p-6 z-30 transform ${
                        sidebarActive ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300 ease-in-out`}
                >
                    <nav className="space-y-3">
                        {sidebarLinks.map((link, index) => (
                            <div key={index} className="group relative">
                                <button
                                    onClick={() => {
                                        setActiveLink(link.title);
                                        if (window.innerWidth < 768) {
                                            setSidebarActive(false);
                                        }
                                    }}
                                    className={`w-full text-left py-2 px-4 rounded-lg transition-all duration-200 cursor-pointer ${
                                        activeLink === link.title
                                            ? "bg-gray-100 text-blue-600"
                                            : "hover:bg-gray-50 hover:text-blue-600"
                                    }`}
                                >
                                    {link.title}
                                </button>
                                <div className="hidden md:group-hover:block absolute left-full top-0 ml-2 w-64 bg-white p-4 rounded-lg shadow-xl z-50">
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
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden cursor-pointer"
                        onClick={toggleSidebar}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8 bg-white md:my-8 md:mx-8 rounded-xl shadow-sm">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6">
                        How can we help you?
                    </h1>

                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="flex items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-300">
                            <span className="text-gray-500 mr-2 cursor-pointer">🔍</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ask me..."
                                className="flex-1 outline-none text-sm md:text-base cursor-text"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-500 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                        >
                            Search
                        </button>
                    </form>

                    {/* Content Section */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {activeLink}
                        </h2>

                        {activeContent}

                        {/* Related Articles */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-700 mb-2">
                                Related Articles
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-600">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:underline cursor-pointer"
                                    >
                                        How to create your first memory
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:underline cursor-pointer"
                                    >
                                        Privacy settings explained
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:underline cursor-pointer"
                                    >
                                        Troubleshooting common issues
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default HelpPage;