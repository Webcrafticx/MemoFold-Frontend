import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import vacation from "../../assets/vacation.jpg";
import journey from "../../assets/journey.png";
import memory from "../../assets/memory.png";
import child from "../../assets/child.jpg";
import college from "../../assets/college.jpg";

const About = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const handleAuthAction = () => {
        if (token) {
            logout();
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="font-sans bg-gray-50 text-gray-800 leading-relaxed">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col cursor-pointer">
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

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-cyan-50 to-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    <div className="lg:flex-1 text-center lg:text-left">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-blue-600 mb-6 leading-tight">
                            Watch and Share
                            <br />
                            Your Life's Journey
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
                            MemoFold helps you relive your memories—from the
                            first cry to today's smile—like a living diary you
                            build as life unfolds.
                        </p>
                        {!token && (
                            <div className="mt-6">
                                <Link
                                    to="/signup"
                                    className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-6 rounded-full hover:from-emerald-600 hover:to-green-500 transition-all cursor-pointer"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                    <img
                        src={journey}
                        alt="Journey"
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all cursor-pointer"
                    />
                </div>
            </section>

            {/* Description Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
                    <img
                        src={memory}
                        alt="Memories"
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all lg:flex-1 cursor-pointer"
                    />
                    <div className="lg:flex-1 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl text-blue-800 mb-4">
                            Your Memories Matter
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto lg:mx-0">
                            Memory Folding is a living library of untold lives.
                            From your earliest moments to major milestones,
                            MemoFold captures every fold of your story—like a
                            Wikipedia for the unsung, giving voice to the
                            memories that shaped you.
                        </p>
                        {token && (
                            <div className="mt-6">
                                <Link
                                    to="/dashboard"
                                    className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-6 rounded-full hover:from-indigo-600 hover:to-blue-500 transition-all cursor-pointer"
                                >
                                    View Your Memories
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Childhood Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    <img
                        src={child}
                        alt="Childhood"
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all lg:flex-1 cursor-pointer"
                    />
                    <div className="lg:flex-1 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl text-blue-800 mb-4">
                            Feel the Past Emotions
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto lg:mx-0">
                            Look back at cherished memories that bring a smile,
                            spark joy, and stir nostalgia. Every laugh, tear,
                            and hug is worth remembering.
                        </p>
                    </div>
                </div>
            </section>

            {/* College Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
                    <img
                        src={college}
                        alt="College"
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all lg:flex-1 cursor-pointer"
                    />
                    <div className="lg:flex-1 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl text-blue-800 mb-4">
                            Relive Your Academic Era
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto lg:mx-0">
                            Capture unforgettable academic moments, inspiring
                            lessons, and lifelong friendships that shaped your
                            journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* Travel Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    <img
                        src={vacation}
                        alt="Vacation"
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all lg:flex-1 cursor-pointer"
                    />
                    <div className="lg:flex-1 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl text-blue-800 mb-4">
                            Treasure Your Travel Escapades
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto lg:mx-0">
                            Revisit destinations that sparked your soul, from
                            mountain peaks to seaside sunsets. MemoFold lets you
                            preserve and share these precious moments.
                        </p>
                    </div>
                </div>
            </section>

            {/* Meet Our Founders Section */}
            <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 mb-4">
                            Meet Our Founders
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            The visionaries behind MemoFold who are passionate about 
                            preserving life's precious moments
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Founder Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">SK</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Sumit Kumar</h3>
                                <p className="text-blue-600 font-medium mb-4">Founder</p>
                                <a 
                                    href="mailto:sumitkumaryks@gmail.com"
                                    className="text-gray-600 hover:text-blue-600 transition-colors inline-block"
                                >
                                    sumitkumaryks@gmail.com
                                </a>
                            </div>
                        </div>

                        {/* Co-founder Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">AV</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Anurag Verma</h3>
                                <p className="text-blue-600 font-medium mb-4">Co-founder</p>
                                <a 
                                    href="mailto:vermaanurag0209@gmail.com"
                                    className="text-gray-600 hover:text-blue-600 transition-colors inline-block"
                                >
                                    vermaanurag0209@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Development Credit */}
                    <div className="text-center mt-12 pt-8 border-t border-gray-200">
                        <p className="text-gray-600 mb-2">Developed by</p>
                        <a 
                            href="https://www.webcrafticx.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100"
                        >
                            <span className="text-lg font-bold text-blue-700">WebCrafticX</span>
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;