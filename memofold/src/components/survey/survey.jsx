// Survey.jsx
import React from "react";

const Survey = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-0 transition-colors duration-300">
            <div className="max-w-[600px] mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 my-8 md:my-12 transition-colors duration-400">
                <h1 className="text-2xl md:text-2xl font-semibold text-blue-600 mb-2">
                    Your Opinion Matters
                </h1>
                <p className="text-gray-600 text-sm md:text-base mb-6">
                    Please help us improve by filling out this quick survey.
                </p>

                <form className="space-y-6">
                    <div className="space-y-2 text-left">
                        <label
                            htmlFor="q1"
                            className="block font-semibold text-gray-800"
                        >
                            How satisfied are you with our website?
                        </label>
                        <select
                            id="q1"
                            name="satisfaction"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-300"
                        >
                            <option value="">Select...</option>
                            <option value="very_satisfied">
                                Very Satisfied
                            </option>
                            <option value="satisfied">Satisfied</option>
                            <option value="neutral">Neutral</option>
                            <option value="unsatisfied">Unsatisfied</option>
                            <option value="very_unsatisfied">
                                Very Unsatisfied
                            </option>
                        </select>
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="block font-semibold text-gray-800">
                            Which features do you use most? (Select all that
                            apply)
                        </label>
                        <div className="flex flex-wrap gap-3 md:gap-4">
                            <label className="flex items-center font-medium text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="features"
                                    value="posts"
                                    className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                Posts
                            </label>
                            <label className="flex items-center font-medium text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="features"
                                    value="profile"
                                    className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                Profile
                            </label>
                            <label className="flex items-center font-medium text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="features"
                                    value="notifications"
                                    className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                Notifications
                            </label>
                            <label className="flex items-center font-medium text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="features"
                                    value="gallery"
                                    className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                Gallery
                            </label>
                            <label className="flex items-center font-medium text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="features"
                                    value="settings"
                                    className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                Settings
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2 text-left">
                        <label
                            htmlFor="q3"
                            className="block font-semibold text-gray-800"
                        >
                            What improvements would you like to see?
                        </label>
                        <textarea
                            id="q3"
                            name="improvements"
                            rows="4"
                            placeholder="Your suggestions..."
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y transition-colors duration-300"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-cyan-500 hover:-translate-y-0.5 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Submit Survey
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center bg-gray-100 text-gray-800 px-5 py-2 rounded-full font-semibold text-sm shadow-sm hover:bg-gray-200 hover:-translate-y-0.5 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    >
                        <span className="mr-1">🔙</span> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Survey;
