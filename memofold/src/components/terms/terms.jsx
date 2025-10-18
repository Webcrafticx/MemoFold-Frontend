import React from "react";
import logo from "../../assets/logo.png";

const TermsOfService = () => {
    const redirectToLogin = () => {
        // Implement login redirection logic
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 font-['Inter'] text-gray-800 p-5">
            {/* Top Bar */}
            <header className="flex justify-end items-center py-3 px-6 bg-gray-50 shadow-sm">
                <button
                    onClick={redirectToLogin}
                    className="flex cursor-pointer items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-2 px-4 rounded-full hover:from-cyan-500 hover:to-blue-600 transition-colors"
                >
                    <img
                        src={logo}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>Login</span>
                </button>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-xl my-8">
                {/* Page Header */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-gray-600">
                        Please read these terms carefully before using Memofold.
                    </p>
                </header>

                {/* Accordion Section */}
                <section className="space-y-4 mb-10">
                    {/* Accordion Item 1 */}
                    <details
                        open
                        className="bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all"
                    >
                        <summary className="cursor-pointer text-lg font-semibold text-blue-700 list-none">
                            📘 1. Acceptance of Terms
                        </summary>
                        <p className="mt-3 text-gray-700">
                            By accessing or using Memofold, you agree to be
                            bound by these Terms. If you don't agree, please do
                            not use the service.
                        </p>
                    </details>

                    {/* Accordion Item 2 */}
                    <details className="bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all">
                        <summary className="cursor-pointer text-lg font-semibold text-blue-700 list-none">
                            🛠 2. Using Memofold
                        </summary>
                        <p className="mt-3 text-gray-700">
                            Memofold is a platform to preserve and share life
                            journeys. You agree not to misuse the service or
                            upload harmful content.
                        </p>
                    </details>

                    {/* Accordion Item 3 */}
                    <details className="bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all">
                        <summary className="cursor-pointer text-lg font-semibold text-blue-700 list-none">
                            🔐 3. Privacy and Data
                        </summary>
                        <p className="mt-3 text-gray-700">
                            Your privacy is important to us. Refer to our{" "}
                            <a
                                href="/privacy"
                                className="text-blue-600 hover:underline"
                            >
                                Privacy Policy
                            </a>{" "}
                            to learn how we handle your data.
                        </p>
                    </details>

                    {/* Accordion Item 4 */}
                    <details className="bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all">
                        <summary className="cursor-pointer text-lg font-semibold text-blue-700 list-none">
                            📷 4. Content Ownership
                        </summary>
                        <p className="mt-3 text-gray-700">
                            You retain ownership of your uploaded memories and
                            stories. You grant Memofold a license to display and
                            store them.
                        </p>
                    </details>

                    {/* Accordion Item 5 */}
                    <details className="bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all">
                        <summary className="cursor-pointer text-lg font-semibold text-blue-700 list-none">
                            ❌ 5. Termination
                        </summary>
                        <p className="mt-3 text-gray-700">
                            We may suspend or terminate your access if you
                            violate our terms or misuse the platform in any way.
                        </p>
                    </details>

                    {/* Accordion Item 6 */}
                    <details className="bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all">
                        <summary className="cursor-pointer text-lg font-semibold text-blue-700 list-none">
                            📆 6. Changes to Terms
                        </summary>
                        <p className="mt-3 text-gray-700">
                            We may update these terms periodically. We'll notify
                            you through the platform or email when major updates
                            happen.
                        </p>
                    </details>
                </section>

                {/* Footer */}
                <footer className="text-center text-gray-500">
                    <p>© 2025 MemoFold</p>
                </footer>
            </div>
        </div>
    );
};

export default TermsOfService;
