import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const TermsOfService = () => {
    const [openSection, setOpenSection] = useState(0);
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

    const sections = [
        {
            title: "📘 1. Acceptance of Terms",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        By accessing or using MemoFold, you agree to be bound by
                        these Terms. If you don't agree, please do not use the
                        service.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            You must be at least 13 years old to use MemoFold
                        </li>
                        <li>
                            You are responsible for maintaining the security of
                            your account
                        </li>
                        <li>
                            You agree to provide accurate information during
                            registration
                        </li>
                    </ul>
                </>
            ),
        },
        {
            title: "🛠 2. Using MemoFold",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        MemoFold is a platform to preserve and share life
                        journeys. You agree not to misuse the service or upload
                        harmful content.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            Do not upload content that violates others' rights
                        </li>
                        <li>
                            Do not engage in harassment, bullying, or hate
                            speech
                        </li>
                        <li>
                            Do not attempt to disrupt or overload our services
                        </li>
                        <li>Respect other users' privacy and boundaries</li>
                    </ul>
                </>
            ),
        },
        {
            title: "🔐 3. Privacy and Data",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        Your privacy is important to us. We handle your data
                        with care and transparency.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            We collect only necessary data to provide our
                            services
                        </li>
                        <li>Your memories are encrypted and stored securely</li>
                        <li>You control who can see your content</li>
                        <li>
                            Refer to our{" "}
                            <Link
                                to="/privacy"
                                className="text-blue-600 hover:underline cursor-pointer"
                            >
                                Privacy Policy
                            </Link>{" "}
                            for detailed information
                        </li>
                    </ul>
                </>
            ),
        },
        {
            title: "📷 4. Content Ownership",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        You retain ownership of your uploaded memories and
                        stories.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            You own all content you create and share on MemoFold
                        </li>
                        <li>
                            You grant MemoFold a license to display and store
                            your content
                        </li>
                        <li>
                            This license ends when you delete your content or
                            account
                        </li>
                        <li>You are responsible for the content you upload</li>
                    </ul>
                </>
            ),
        },
        {
            title: "❌ 5. Termination",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        We may suspend or terminate your access under certain
                        circumstances.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            Violation of these terms or community guidelines
                        </li>
                        <li>Misuse of the platform or harmful behavior</li>
                        <li>Legal requirements or regulatory obligations</li>
                        <li>You can delete your account at any time</li>
                    </ul>
                </>
            ),
        },
        {
            title: "📆 6. Changes to Terms",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        We may update these terms periodically to improve our
                        services.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            We'll notify you through the platform or email for
                            major updates
                        </li>
                        <li>
                            Continued use after changes means you accept the new
                            terms
                        </li>
                        <li>
                            You can review the current terms anytime on this
                            page
                        </li>
                        <li>
                            Significant changes will include a 30-day notice
                            period
                        </li>
                    </ul>
                </>
            ),
        },
        {
            title: "⚖️ 7. Legal Rights",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        Understanding your legal rights and responsibilities.
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>MemoFold is provided "as is" without warranties</li>
                        <li>
                            We are not liable for indirect or incidental damages
                        </li>
                        <li>These terms are governed by applicable laws</li>
                        <li>Disputes will be resolved through arbitration</li>
                    </ul>
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
                {/* Terms Header */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-3 sm:mb-4">
                        📜 Terms of Service
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        Please read these terms carefully before using MemoFold.
                    </p>
                </div>

                {/* Terms Content */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto">
                    {/* Introduction */}
                    <div className="mb-6 sm:mb-8 text-center">
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            Welcome to MemoFold! These Terms of Service govern
                            your use of our platform and services. By accessing
                            or using MemoFold, you agree to be bound by these
                            terms.
                        </p>
                    </div>

                    {/* Last Updated */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
                        <p className="text-blue-800 text-sm sm:text-base text-center font-medium">
                            Last Updated: January 2025 | Version 2.0
                        </p>
                    </div>

                    {/* Accordion Sections */}
                    <div className="space-y-3 sm:space-y-4">
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

                    {/* Agreement Section */}
                    <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                            Your Agreement
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base text-center mb-4">
                            By using MemoFold, you acknowledge that you have
                            read, understood, and agree to be bound by these
                            Terms of Service.
                        </p>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Questions? Contact us at{" "}
                                <a
                                    href="mailto:legal@memofold.com"
                                    className="text-blue-600 hover:underline font-medium break-all"
                                >
                                    legal@memofold.com
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
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
                            to="/help"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                        >
                            ❓ Help Center
                        </Link>
                        <span className="text-gray-400 hidden sm:inline">
                            •
                        </span>
                        <Link
                            to="/about"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-sm sm:text-base cursor-pointer"
                        >
                            ℹ️ About Us
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
                </div>
            </footer>
        </div>
    );
};

export default TermsOfService;
