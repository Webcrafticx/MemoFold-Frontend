import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import vacation from "../../assets/vacation.jpg";
import journey from "../../assets/journey.png";
import memory from "../../assets/memory.png";
import child from "../../assets/child.jpg";
import college from "../../assets/college.jpg";
import founder from "../../assets/Founder.jpg";
import cofounder from "../../assets/Co Founder.jpg";

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
            <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo Section - Improved */}
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <Link
                                to="/"
                                className="flex items-center gap-3 group cursor-pointer"
                            >
                                <div className="relative">
                                    <img
                                        src={logo}
                                        alt="MemoFold Logo"
                                        className="w-14 h-14  rounded-full object-cover"
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
                        </div>

                        {/* Login Button - Improved */}
                        <button
                                                onClick={handleAuthAction}
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
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-cyan-50 to-white py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
                    <div className="lg:flex-1 text-center lg:text-left">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-blue-600 mb-4 sm:mb-6 leading-tight">
                            Watch and Share
                            <br />
                            Your Life's Journey
                        </h1>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
                            MemoFold helps you relive your memories—from the
                            first cry to today's smile—like a living diary you
                            build as life unfolds.
                        </p>
                        {!token && (
                            <div className="mt-4 sm:mt-6">
                                <Link
                                    to="/signup"
                                    className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-5 sm:py-2 sm:px-6 rounded-full hover:from-emerald-600 hover:to-green-500 transition-all cursor-pointer text-sm sm:text-base"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg mt-6 lg:mt-0">
                        <img
                            src={journey}
                            alt="Journey"
                            className="w-full rounded-xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all cursor-pointer"
                        />
                    </div>
                </div>
            </section>

            {/* Description Section */}
            <section className="bg-white py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-12">
                    <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg">
                        <img
                            src={memory}
                            alt="Memories"
                            className="w-full rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer"
                        />
                    </div>
                    <div className="lg:flex-1 text-center lg:text-left mt-6 lg:mt-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl text-blue-800 mb-3 sm:mb-4">
                            Your Memories Matter
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto lg:mx-0 text-sm sm:text-base">
                            Memory Folding is a living library of untold lives.
                            From your earliest moments to major milestones,
                            MemoFold captures every fold of your story—like a
                            Wikipedia for the unsung, giving voice to the
                            memories that shaped you.
                        </p>
                        {token && (
                            <div className="mt-4 sm:mt-6">
                                <Link
                                    to="/dashboard"
                                    className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-5 sm:py-2 sm:px-6 rounded-full hover:from-indigo-600 hover:to-blue-500 transition-all cursor-pointer text-sm sm:text-base"
                                >
                                    View Your Memories
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Childhood Section */}
            <section className="bg-white py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
                    <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg">
                        <img
                            src={child}
                            alt="Childhood"
                            className="w-full rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer"
                        />
                    </div>
                    <div className="lg:flex-1 text-center lg:text-left mt-6 lg:mt-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl text-blue-800 mb-3 sm:mb-4">
                            Feel the Past Emotions
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto lg:mx-0 text-sm sm:text-base">
                            Look back at cherished memories that bring a smile,
                            spark joy, and stir nostalgia. Every laugh, tear,
                            and hug is worth remembering.
                        </p>
                    </div>
                </div>
            </section>

            {/* College Section */}
            <section className="bg-white py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-12">
                    <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg">
                        <img
                            src={college}
                            alt="College"
                            className="w-full rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer"
                        />
                    </div>
                    <div className="lg:flex-1 text-center lg:text-left mt-6 lg:mt-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl text-blue-800 mb-3 sm:mb-4">
                            Relive Your Academic Era
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto lg:mx-0 text-sm sm:text-base">
                            Capture unforgettable academic moments, inspiring
                            lessons, and lifelong friendships that shaped your
                            journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* Travel Section */}
            <section className="bg-white py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
                    <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg">
                        <img
                            src={vacation}
                            alt="Vacation"
                            className="w-full rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer"
                        />
                    </div>
                    <div className="lg:flex-1 text-center lg:text-left mt-6 lg:mt-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl text-blue-800 mb-3 sm:mb-4">
                            Treasure Your Travel Escapades
                        </h2>
                        <p className="text-gray-600 max-w-lg mx-auto lg:mx-0 text-sm sm:text-base">
                            Revisit destinations that sparked your soul, from
                            mountain peaks to seaside sunsets. MemoFold lets you
                            preserve and share these precious moments.
                        </p>
                    </div>
                </div>
            </section>

            {/* Meet Our Founders Section */}
            <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mb-3 sm:mb-4">
                            Meet Our Founders
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                            The visionaries behind MemoFold who are passionate
                            about preserving life's precious moments
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                        {/* Founder Card */}
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="text-center">
                                <div className="w-40 h-40 mx-auto mb-3 sm:mb-4 transition-all duration-300 hover:scale-105">
                                    <img
                                        className="w-full h-full  rounded-full object-contain border-4 border-white shadow-md"
                                        src={founder}
                                        alt="Sumit Kumar - Founder"
                                    />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                                    Sumit Kumar
                                </h3>
                                <p className="text-blue-600 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                                    Founder
                                </p>
                                <a
                                    href="mailto:sumitkumaryks@gmail.com"
                                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300 inline-block text-sm sm:text-base break-all"
                                >
                                    sumitkumaryks@gmail.com
                                </a>
                            </div>
                        </div>

                        {/* Co-founder Card */}
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="text-center">
                                <div className="w-40 h-40 mx-auto mb-3 sm:mb-4 transition-all duration-300 hover:scale-105 overflow-hidden rounded-full border-4 border-white shadow-md">
                                    <img
                                        className="w-full h-full  rounded-full object-contain border-4 border-white shadow-md"
                                        src={cofounder}
                                        alt="Anurag Verma - Co-founder"
                                    />
                                </div>

                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                                    Anurag Verma
                                </h3>
                                <p className="text-blue-600 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                                    Co-founder
                                </p>
                                <a
                                    href="mailto:vermaanurag0209@gmail.com"
                                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300 inline-block text-sm sm:text-base break-all"
                                >
                                    vermaanurag0209@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 sm:py-6">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-3 sm:gap-4">
                        {/* Right side - Copyright */}
                        <div className="text-gray-600 text-xs sm:text-sm text-center">
                            © Copyright 2025 MemoFold | All Rights Reserved
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default About;
