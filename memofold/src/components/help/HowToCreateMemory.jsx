import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const HowToCreateMemory = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleAuthAction = () => {
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-50 to-blue-50 font-['Inter'] ">
            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col cursor-pointer" onClick={() => navigate("/")}> 
                        <div className="text-3xl sm:text-4xl font-bold text-black leading-none">
                            MemoFold
                        </div>
                        <div className="text-sm text-gray-500 italic">
                            "Write your life before it fades."
                        </div>
                    </div>
                    <button
                        onClick={handleAuthAction}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-2 px-4 rounded-full text-base hover:from-cyan-500 hover:to-blue-600 transition-colors cursor-pointer"
                    >
                        <img
                            src={logo}
                            alt={token ? "Logout" : "Login"}
                            className="w-8 h-8 rounded-full object-cover cursor-pointer"
                        />
                        {token ? "Logout" : "Login"}
                    </button>
                </div>
            </header>

            {/* Main Container */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 max-w-4xl mx-auto">
                {/* Header */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                        📝 How to Create Your First Memory
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600">
                        Follow these steps to save your special moments on MemoFold.
                    </p>
                </header>

                {/* Steps Section */}
                <div className="space-y-4">
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                        <li>Log in to your MemoFold account.</li>
                        <li>Click the <span className="font-bold">'+'</span> button in the navigation bar.</li>
                        <li>Select photos or videos from your device that you want to save as a memory.</li>
                        <li>Add a caption to describe your memory.</li>
                        <li>Select emotions that best represent your memory.</li>
                        <li>Choose privacy settings to control who can view your memory.</li>
                        <li>Click <span className="font-bold">"Post"</span> to save and share your memory.</li>
                    </ol>
                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                        <h2 className="font-semibold text-blue-700 mb-2">Tips:</h2>
                        <ul className="list-disc pl-5 space-y-1 text-blue-700">
                            <li>You can always edit or delete your memory later from your profile.</li>
                            <li>Tagging emotions helps you find memories easily in the future.</li>
                            <li>Use Folds to organize related memories into collections.</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center mt-12 text-gray-500">
                    <p>© 2026 MemoFold</p>
                </footer>
            </div>
        </div>
    );
};

export default HowToCreateMemory;
