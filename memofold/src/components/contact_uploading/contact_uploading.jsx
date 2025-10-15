import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const ContactUploading = () => {
    const [openSection, setOpenSection] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        request: "",
        message: "",
    });
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log("Form submitted:", formData);
        // Add your form submission logic here
    };

    const sections = [
        {
            title: "📇 What is Contact Uploading and Why Do We Use It?",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        Contact uploading is a feature that allows MemoFold to
                        sync with your address book — but only with your
                        explicit permission. This helps you discover friends who
                        are already on the platform, reconnect with people you
                        care about, and create meaningful connections through
                        shared memories and posts.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>Discover friends already using MemoFold</li>
                        <li>Reconnect with important people in your life</li>
                        <li>
                            Create meaningful connections through shared
                            memories
                        </li>
                        <li>
                            Contact syncing does not post anything or notify
                            your contacts
                        </li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        It simply enhances your experience by making connections
                        easier and more personalized.
                    </p>
                </>
            ),
        },
        {
            title: "👤 How We Respect the Privacy of Non-Members",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        Not everyone is on MemoFold — and that's okay. When you
                        upload contacts that include people who haven't joined,
                        we never create profiles for them or store unnecessary
                        data.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>We never create profiles for non-members</li>
                        <li>
                            Information is used solely to improve your
                            experience
                        </li>
                        <li>
                            We never send invitations without your permission
                        </li>
                        <li>
                            Non-users can request immediate removal from our
                            system
                        </li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        Their information is used solely to improve your
                        experience, such as suggesting people you may know.
                    </p>
                </>
            ),
        },
        {
            title: "🔒 Your Contacts, Your Control — How We Secure Your Data",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        Your contact information is encrypted from the moment
                        it's uploaded. We follow industry best practices in data
                        security, and we do not sell, trade, or share your
                        contact data with any third parties.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>End-to-end encryption for all contact data</li>
                        <li>Industry-standard security practices</li>
                        <li>No selling or sharing with third parties</li>
                        <li>Full control through your account settings</li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        You have full control — you can view your synced
                        contacts, manage visibility, or delete uploaded data at
                        any time through your account settings.
                    </p>
                </>
            ),
        },
    ];

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
                            <span className="hidden xs:inline">
                                {token ? "Logout" : "Get Started"}
                            </span>
                            <span className="xs:hidden">
                                {token ? "Logout" : "Login"}
                            </span>
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
                {/* Page Header */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-3 sm:mb-4">
                        🔗 Contact Uploading & Non-User Policy
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto px-4">
                        At <strong>MemoFold</strong>, we believe that your
                        connections define your digital story. Every interaction
                        matters, and we're committed to protecting your privacy.
                    </p>
                </div>

                {/* Content Container */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto">
                    {/* Introduction */}
                    <div className="mb-6 sm:mb-8 text-center">
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4">
                            This page outlines how we use your contact
                            information responsibly, how we treat individuals
                            who are not yet members of our platform, and how we
                            ensure transparency and control are always in your
                            hands.
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            From the moment you sync your contacts, we
                            prioritize safety, consent, and respect — because
                            your trust is our most important connection.
                        </p>
                    </div>

                    {/* Info Sections */}
                    <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 transition-all duration-300 cursor-pointer ${
                                    openSection === index
                                        ? "bg-blue-50 border-blue-200 shadow-md"
                                        : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                                }`}
                                onClick={() => toggleSection(index)}
                            >
                                <button className="w-full flex justify-between items-center font-bold text-sm sm:text-base lg:text-lg focus:outline-none cursor-pointer text-left">
                                    <span className="pr-4 flex-1">
                                        {section.title}
                                    </span>
                                    <span
                                        className={`transform transition-transform duration-300 flex-shrink-0 ${
                                            openSection === index
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    >
                                        <svg
                                            className="w-4 h-4 sm:w-5 sm:h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </span>
                                </button>

                                {openSection === index && (
                                    <div className="mt-3 sm:mt-4 text-gray-700 animate-fadeIn">
                                        {section.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Section */}
                    <section className="mt-8 sm:mt-12">
                        <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 mb-3 sm:mb-4">
                                📬 Submit a Request or Concern
                            </h2>
                            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
                                Whether you're a registered user or someone
                                listed in an uploaded contact list, we're here
                                to support your rights and respond to your
                                concerns.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 sm:gap-5 max-w-2xl mx-auto"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block font-semibold text-gray-800 mb-2 text-sm sm:text-base"
                                >
                                    Your Full Name{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. John Doe"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block font-semibold text-gray-800 mb-2 text-sm sm:text-base"
                                >
                                    Email Address{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="request"
                                    className="block font-semibold text-gray-800 mb-2 text-sm sm:text-base"
                                >
                                    Request Type{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="request"
                                    name="request"
                                    value={formData.request}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                >
                                    <option value="">
                                        Select a type of request
                                    </option>
                                    <option value="delete">
                                        🗑️ Delete My Uploaded Contacts
                                    </option>
                                    <option value="info">
                                        📘 Request More Info About Data Use
                                    </option>
                                    <option value="non-user">
                                        🚫 Remove Me from Contact Database
                                        (Non-User)
                                    </option>
                                    <option value="general">
                                        ✉️ General Privacy Concern or Feedback
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="message"
                                    className="block font-semibold text-gray-800 mb-2 text-sm sm:text-base"
                                >
                                    Additional Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Describe your request in detail (optional)..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base resize-vertical"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-500 hover:to-blue-600 hover:shadow-xl transition-all duration-300 cursor-pointer text-sm sm:text-base mt-2"
                            >
                                Send Request
                            </button>
                        </form>

                        {/* Contact Information */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600 text-sm">
                                Prefer to email us directly? Contact us at{" "}
                                <a
                                    href="mailto:privacy@memofold.com"
                                    className="text-blue-600 hover:underline font-medium break-all"
                                >
                                    privacy@memofold.com
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Quick Links */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/privacy"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                        >
                            📋 Privacy Policy
                        </Link>
                        <span className="text-gray-400 hidden sm:inline">
                            •
                        </span>
                        <Link
                            to="/terms"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                        >
                            📜 Terms of Service
                        </Link>
                        <span className="text-gray-400 hidden sm:inline">
                            •
                        </span>
                        <Link
                            to="/help"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                        >
                            ❓ Help Center
                        </Link>
                    </div>
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
                    <div className="text-center mt-2">
                        <p className="text-gray-500 text-xs">
                            We don't just connect people. We protect them. Your
                            trust means everything to us.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ContactUploading;
