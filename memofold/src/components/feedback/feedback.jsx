import React, { useState, useEffect } from "react";
import { apiService } from "../../services/api";

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        type: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [error, setError] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 🔥 Dark mode localStorage se read karo
    useEffect(() => {
        const savedTheme = localStorage.getItem("darkMode");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "true");
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSubmitMessage("");

        try {
            const data = await apiService.submitContactRequest({
                name: formData.name,
                email: formData.email,
                message: formData.message,
                requestType: formData.type,
            });
            // console.log("Feedback submitted successfully:", data);

            setSubmitMessage("Thank you for your feedback!");
            setFormData({
                name: "",
                email: "",
                type: "",
                message: "",
            });
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setError("Failed to submit feedback. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={`min-h-screen font-['Inter'] p-5 flex items-center justify-center transition-colors ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
        >
            <div
                className={`w-full max-w-lg rounded-2xl shadow-xl p-8 sm:p-10 text-center transition-colors ${
                    isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                }`}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 mb-3">
                    Share Your Feedback
                </h1>
                <p
                    className={`text-sm sm:text-base mb-8 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                    We'd love to hear your thoughts or help you with any issues
                    you've encountered.
                </p>

                <form onSubmit={handleSubmit} className="text-left">
                    <div className="mb-5">
                        <label
                            htmlFor="name"
                            className={`block text-sm font-semibold mb-2 ${
                                isDarkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                            className={`cursor-pointer w-full px-4 py-3 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-black"
                            }`}
                        />
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="email"
                            className={`block text-sm font-semibold mb-2 ${
                                isDarkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@domain.com"
                            required
                            className={`cursor-pointer w-full px-4 py-3 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-black"
                            }`}
                        />
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="type"
                            className={`block text-sm font-semibold mb-2 ${
                                isDarkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            What is this about?
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className={`cursor-pointer w-full px-4 py-3 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-black"
                            }`}
                        >
                            <option value="">Choose an option</option>
                            <option value="General Feedback">
                                General Feedback
                            </option>
                            <option value="Report a Bug">Report a Bug</option>
                            <option value="Feature Request">
                                Feature Request
                            </option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="message"
                            className={`block text-sm font-semibold mb-2 ${
                                isDarkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            Your Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            rows="6"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write your message here..."
                            required
                            className={`cursor-pointer w-full px-4 py-3 text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px] ${
                                isDarkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-black"
                            }`}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="cursor-pointer w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-500 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70"
                    >
                        {isSubmitting ? "Sending..." : "Send Feedback"}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 text-red-400 text-sm">{error}</div>
                )}

                {submitMessage && (
                    <div className="mt-4 text-green-400 text-sm">
                        {submitMessage}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => window.history.back()}
                        className={`cursor-pointer inline-block px-6 py-2 font-semibold rounded-full shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm ${
                            isDarkMode
                                ? "bg-gray-700 text-white hover:bg-gray-600"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                        🔙 Go Back
                    </button>
                </div>

                {/* <div className="mt-8 text-center">
                    <a
                        href="/survey"
                        className={`cursor-pointer inline-block px-6 py-2 font-semibold rounded-full shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm ${
                            isDarkMode
                                ? "bg-gray-700 text-white hover:bg-gray-600"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                        📋 Take Our Quick Survey
                    </a>
                </div> */}
            </div>
        </div>
    );
};

export default FeedbackForm;
