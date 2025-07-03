import React from "react";
import logo from "../../assets/logo.png";
import vacation from "../../assets/vacation.jpg";
import journey from "../../assets/journey.png";
import memory from "../../assets/memory.png";
import child from "../../assets/child.jpg";
import college from "../../assets/college.jpg";

const About = () => {
    return (
        <div className="font-sans bg-gray-50 text-gray-800 leading-relaxed">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col">
                        <div className="text-3xl sm:text-4xl font-bold text-black leading-none">
                            MemoFold
                        </div>
                        <div className="text-sm text-gray-500 italic">
                            "Write your life before it fades."
                        </div>
                    </div>
                    <a
                        href="#"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-2 px-4 rounded-full text-base hover:from-cyan-500 hover:to-blue-600 transition-colors"
                    >
                        <img
                            src={logo}
                            alt="Login"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        Log in
                    </a>
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
                    </div>
                    <img
                        src={journey}
                        alt="Journey"
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all"
                    />
                </div>
            </section>

            {/* Description Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
                    <img
                        src={memory}
                        alt="Memories"
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all lg:flex-1"
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
                    </div>
                </div>
            </section>

            {/* Childhood Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                    <img
                        src={child}
                        alt="Childhood"
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all lg:flex-1"
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
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all lg:flex-1"
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
                        className="w-full max-w-md lg:max-w-lg rounded-xl shadow-md hover:scale-[1.02] hover:shadow-lg transition-all lg:flex-1"
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
        </div>
    );
};

export default About;
