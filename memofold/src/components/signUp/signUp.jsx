// SignUp.jsx
import React from "react";

const SignUp = () => {
    return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-5">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                    Create New Account
                </h2>

                <form className="space-y-4">
                    <div>
                        <label
                            htmlFor="realname"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="realname"
                            name="realname"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Username / ID
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Gmail ID
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="example@gmail.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirm-password"
                            name="confirm-password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white py-3 rounded-lg font-bold hover:bg-gradient-to-r hover:from-[#0072ff] hover:to-[#00c6ff] transition-colors"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="text-center">
                    <a
                        href="/login"
                        className="text-[#58c8f4] hover:text-[#0095f6] hover:underline font-medium text-sm transition-colors"
                    >
                        Login with Email
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
