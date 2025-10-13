import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const PrivacyPolicy = () => {
    const [openSection, setOpenSection] = useState(0);
    const navigate = useNavigate();

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? null : index);
    };

    const handleLoginRedirect = () => {
        navigate("/login");
    };

    const sections = [
        {
            title: "1. Information We Collect",
            content: (
                <>
                    <p>At MemoFold, your memories are sacred. We collect:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
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
                    <p className="mt-3">
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
                    <p>
                        We use your data to enhance your MemoFold experience by:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
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
                    <p className="mt-3">
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
                    <p>Your data is never sold. It is only shared:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                            With essential service providers (e.g., secure cloud
                            storage)
                        </li>
                        <li>When legally required (e.g., court orders)</li>
                        <li>To protect users in emergencies</li>
                    </ul>
                    <p className="mt-3">
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
                    <p>We use cookies to:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                            Remember your preferences (e.g., theme, language)
                        </li>
                        <li>Keep you logged in securely</li>
                        <li>
                            Understand how you use MemoFold to improve your
                            experience
                        </li>
                    </ul>
                    <p className="mt-3">
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
                    <p>You have full control over your data. You may:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Download your data or export your memories</li>
                        <li>Edit or delete posts and media</li>
                        <li>Request full account deletion</li>
                    </ul>
                    <p className="mt-3">
                        Reach us at{" "}
                        <a
                            href="mailto:privacy@memofold.com"
                            className="text-blue-600 hover:underline cursor-pointer"
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
                    <p>We protect your memories with:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                            End-to-end encryption for data transfer and storage
                        </li>
                        <li>Secure cloud infrastructure and data isolation</li>
                        <li>Ongoing security audits and threat monitoring</li>
                    </ul>
                    <p className="mt-3">
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
                    <p>If we update this policy:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>
                            We will notify you clearly through the app or email
                        </li>
                        <li>You can review and consent to any new terms</li>
                    </ul>
                    <p className="mt-3">
                        Changes are made to better serve and protect you — not
                        reduce your privacy.
                    </p>
                </>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-50 to-blue-50 font-['Inter'] p-5">
            {/* Top Bar */}
            <div className="bg-white rounded-xl shadow-md mb-8 p-5 max-w-6xl mx-auto">
                <div className="flex justify-end">
                    <button 
                        onClick={handleLoginRedirect}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-2 px-4 rounded-full hover:from-cyan-500 hover:to-blue-600 hover:scale-105 transition-all cursor-pointer"
                    >
                        <img
                            src={logo}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full object-cover"
                        />
                        Login
                    </button>
                </div>
            </div>

            {/* Main Container */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 max-w-4xl mx-auto">
                {/* Header */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                        📜 Privacy
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600">
                        Your memories are personal. We keep them safe.
                    </p>
                </header>

                {/* Accordion Sections */}
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className={`border rounded-xl p-5 transition-all ${
                                openSection === index
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                        >
                            <button
                                onClick={() => toggleSection(index)}
                                className="w-full flex justify-between items-center font-bold text-lg focus:outline-none cursor-pointer"
                            >
                                <span>{section.title}</span>
                                <span className="text-xl">
                                    {openSection === index ? "−" : "+"}
                                </span>
                            </button>

                            {openSection === index && (
                                <div className="mt-4 text-gray-700">
                                    {section.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <footer className="text-center mt-12 text-gray-500">
                    <p>© 2025 MemoFold</p>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicy;