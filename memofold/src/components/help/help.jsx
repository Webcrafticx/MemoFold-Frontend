import React, { useState } from "react";
import logo from "../../assets/logo.png";

const HelpPage = () => {
    const [sidebarActive, setSidebarActive] = useState(false);
    const [activeLink, setActiveLink] = useState("MemoFold Features");
    const [searchQuery, setSearchQuery] = useState("");

    const sidebarLinks = [
        {
            title: "🧷 MemoFold Features",
            tooltip:
                "Save memories with emotion-rich posts, time capsules, and curated Folds.",
        },
        {
            title: "👤 Your Profile",
            tooltip:
                "Showcase your life story through meaningful moments and shared posts.",
        },
        {
            title: "➕ Sharing Photos and Videos",
            tooltip:
                "Post life moments with captions, emotions, tags, and privacy control.",
        },
        {
            title: "🔍 Exploring Photos and Videos",
            tooltip:
                "Browse real stories and connect through shared emotions and Folds.",
        },
        {
            title: "💬 Messaging",
            tooltip:
                "Talk privately about memories with friends and heartfelt connections.",
        },
        {
            title: "🧑‍🤝‍🧑 Finding Friends",
            tooltip:
                "Discover people with similar memory patterns and life experiences.",
        },
    ];

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle search submission
        console.log("Search query:", searchQuery);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter']">
            {/* Top Bar */}
            <header className="bg-white shadow-sm py-4 px-6 md:px-8 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <a
                    href="mailto:memofold@gmail.com"
                    className="text-blue-600 font-medium hover:underline text-sm md:text-base cursor-pointer"
                >
                    Email Us
                </a>

                <div className="w-full md:w-auto flex justify-end">
                    <button className="flex cursor-pointer items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-500 hover:-translate-y-0.5 transition-all">
                        <img
                            src={logo}
                            alt="User"
                            className="w-7 h-7 rounded-full object-cover shadow-sm"
                        />
                        Log in
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-xl z-40 hover:bg-blue-700 transition-all cursor-pointer"
            >
                {sidebarActive ? "✕" : "☰"}
            </button>

            {/* Main Container */}
            <div className="flex flex-col md:flex-row">
                {/* Sidebar */}
                <aside
                    className={`fixed md:static inset-0 bg-white border-r border-gray-200 w-64 md:w-72 p-6 z-30 transform ${
                        sidebarActive ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300`}
                >
                    <nav className="space-y-3">
                        {sidebarLinks.map((link, index) => (
                            <div key={index} className="group relative">
                                <button
                                    onClick={() => setActiveLink(link.title)}
                                    className={`w-full text-left py-2 px-4 rounded-lg transition-all cursor-pointer ${
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
                        <div className="flex items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                            <span className="text-gray-500 mr-2">🔍</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ask me..."
                                className="flex-1 outline-none text-sm md:text-base"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:from-blue-600 hover:to-cyan-500 hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                            Submit
                        </button>
                    </form>

                    {/* Content Section */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {activeLink}
                        </h2>
                        <p className="text-gray-600">
                            {
                                sidebarLinks.find(
                                    (link) => link.title === activeLink
                                )?.tooltip
                            }
                        </p>

                        {/* Add more detailed content for each section as needed */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-700 mb-2">
                                Related Articles
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-600">
                                <li>
                                    <a href="#" className="hover:underline cursor-pointer">
                                        How to create your first memory
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:underline cursor-pointer">
                                        Privacy settings explained
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:underline cursor-pointer">
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