import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const PrivacyPolicy = () => {
    const [openSection, setOpenSection] = useState(null);
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
            title: "1. Information We Collect",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        At MemoFold, your memories are sacred. We collect:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>Your email address, name, and avatar</li>
                        <li>
                            Photos, videos, audio notes, captions, and memory
                            tags
                        </li>
                        <li>
                            Private messages and shared reactions with friends
                        </li>
                        <li>
                            Device data (e.g., browser, language) to improve
                            performance
                        </li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        Everything is collected with purpose — to make your
                        digital memory journey truly personal and secure.
                    </p>
                </>
            ),
        },
        {
            title: "2. How We Use Your Data",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        We use your data to enhance your MemoFold experience by:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            Creating personalized timelines and memory capsules
                        </li>
                        <li>
                            Recommending emotional trends and reflection prompts
                        </li>
                        <li>
                            Ensuring secure, fast, and intuitive app performance
                        </li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        We never exploit your data — we use it to help you
                        reflect, reconnect, and grow.
                    </p>
                </>
            ),
        },
        {
            title: "3. Data Sharing",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        Your data is never sold. It is only shared:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            With essential service providers (e.g., secure cloud
                            storage)
                        </li>
                        <li>When legally required (e.g., court orders)</li>
                        <li>To protect users in emergencies</li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        Any shared data is protected by contracts and
                        encryption.
                    </p>
                </>
            ),
        },
        {
            title: "4. Cookies",
            content: (
                <>
                    <p className="text-sm sm:text-base">We use cookies to:</p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            Remember your preferences (e.g., theme, language)
                        </li>
                        <li>Keep you logged in securely</li>
                        <li>
                            Understand how you use MemoFold to improve your
                            experience
                        </li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        You can manage or disable cookies anytime through your
                        browser.
                    </p>
                </>
            ),
        },
        {
            title: "5. Your Rights",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        You have full control over your data. You may:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>Download your data or export your memories</li>
                        <li>Edit or delete posts and media</li>
                        <li>Request full account deletion</li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        Reach us at{" "}
                        <a
                            href="mailto:privacy@memofold.com"
                            className="text-blue-600 hover:underline cursor-pointer break-all"
                        >
                            privacy@memofold.com
                        </a>{" "}
                        for any privacy request.
                    </p>
                </>
            ),
        },
        {
            title: "6. Data Security",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        We protect your memories with:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            End-to-end encryption for data transfer and storage
                        </li>
                        <li>Secure cloud infrastructure and data isolation</li>
                        <li>Ongoing security audits and threat monitoring</li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        If a breach ever occurs, we notify you promptly and act
                        transparently.
                    </p>
                </>
            ),
        },
        {
            title: "7. Changes to Policy",
            content: (
                <>
                    <p className="text-sm sm:text-base">
                        If we update this policy:
                    </p>
                    <ul className="list-disc pl-4 sm:pl-6 mt-2 space-y-1 text-sm sm:text-base">
                        <li>
                            We will notify you clearly through the app or email
                        </li>
                        <li>You can review and consent to any new terms</li>
                    </ul>
                    <p className="mt-3 text-sm sm:text-base">
                        Changes are made to better serve and protect you — not
                        reduce your privacy.
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
                {/* Privacy Policy Header */}
                <div className="text-center mb-6 sm:mb-8 lg:mb-12">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-3 sm:mb-4">
                        📜 Privacy Policy
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        Your memories are personal. We keep them safe.
                    </p>
                </div>

                {/* Privacy Policy Content */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 xl:p-10 max-w-4xl mx-auto">
                    {/* Introduction */}
                    <div className="mb-6 sm:mb-8 text-center">
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                            At MemoFold, we believe your memories deserve the
                            utmost respect and protection. This policy explains
                            how we collect, use, and safeguard your personal
                            information.
                        </p>
                    </div>

                    {/* Last Updated */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
                        <p className="text-blue-800 text-sm sm:text-base text-center font-medium">
                            Last Updated: January 2025
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

                    {/* Contact Information */}
                    <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                            Questions or Concerns?
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base text-center">
                            Contact our privacy team at{" "}
                            <a
                                href="mailto:privacy@memofold.com"
                                className="text-blue-600 hover:underline font-medium break-all"
                            >
                                privacy@memofold.com
                            </a>
                        </p>
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

export default PrivacyPolicy;
