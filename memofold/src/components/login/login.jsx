import React, { useState } from "react";
import snip1 from "../../assets/snip1.jpg";
import snip2 from "../../assets/snip2.jpg";
import snip3 from "../../assets/snip3.jpg";
import logo from "../../assets/logo.png";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log("Login submitted:", { username, password });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row justify-center items-center lg:items-start gap-12 lg:gap-20 py-12 px-4 sm:px-6">
                {/* Story Carousel */}
                <div className="relative w-72 h-[500px] flex items-center justify-center">
                    <div className="absolute w-64 h-[450px] -left-8 -rotate-3 overflow-hidden rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 z-10 hover:z-30">
                        <img
                            src={snip1}
                            alt="Story 1"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-3/5 h-2 border-2 border-white rounded-full opacity-90"></div>
                    </div>
                    <div className="absolute w-64 h-[450px] z-20 overflow-hidden rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:z-30">
                        <img
                            src={snip2}
                            alt="Story 2"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-3/5 h-2 border-2 border-white rounded-full opacity-90"></div>
                    </div>
                    <div className="absolute w-64 h-[450px] left-8 rotate-3 overflow-hidden rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 z-10 hover:z-30">
                        <img
                            src={snip3}
                            alt="Story 3"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-3/5 h-2 border-2 border-white rounded-full opacity-90"></div>
                    </div>
                </div>

                {/* Login Section */}
                <div className="w-full max-w-xs sm:max-w-sm">
                    {/* Login Box */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-lg mb-3">
                        <div className="flex flex-col items-center mb-5">
                            <img
                                src={logo}
                                alt="MemoFold Logo"
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl mb-3"
                            />
                            <div className="text-4xl sm:text-5xl font-['Billabong'] text-gray-900">
                                MemoFold
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Phone number, username, or email"
                                required
                                className="w-full px-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                className="w-full px-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="w-full cursor-pointer py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-md hover:from-blue-600 hover:to-cyan-500 transition-all"
                            >
                                Log In
                            </button>
                        </form>

                        <div className="my-4 text-sm text-gray-600">OR</div>

                        <a
                            href="/forgot-password"
                            className="text-sm text-blue-400 hover:text-blue-500 hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Signup Box */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-lg">
                        <p className="text-sm sm:text-base">
                            Don't have an account?{" "}
                            <a
                                href="/signup"
                                className="text-blue-400 font-bold hover:text-blue-500 hover:underline"
                            >
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 py-4 px-4 sm:px-6 text-center">
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-2">
                    <a
                        href="/about"
                        className="text-xs sm:text-sm text-gray-600 hover:underline"
                    >
                        About
                    </a>
                    <a
                        href="/help"
                        className="text-xs sm:text-sm text-gray-600 hover:underline"
                    >
                        Help
                    </a>
                    <a
                        href="/api"
                        className="text-xs sm:text-sm text-gray-600 hover:underline"
                    >
                        API
                    </a>
                    <a
                        href="/privacy"
                        className="text-xs sm:text-sm text-gray-600 hover:underline"
                    >
                        Privacy
                    </a>
                    <a
                        href="/terms"
                        className="text-xs sm:text-sm text-gray-600 hover:underline"
                    >
                        Terms
                    </a>
                    <a
                        href="/contact"
                        className="text-xs sm:text-sm text-gray-600 hover:underline"
                    >
                        Contact Uploading & Non-Users
                    </a>
                </div>
                <div className="text-xs text-gray-500">© 2025 MemoFold</div>
            </footer>
        </div>
    );
};

export default LoginPage;