import React, { useState } from "react";

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        type: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        setTimeout(() => {
            console.log("Form submitted:", formData);
            setSubmitMessage("Thank you for your feedback!");
            setIsSubmitting(false);
            setFormData({
                name: "",
                email: "",
                type: "",
                message: "",
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter'] p-5 flex items-center justify-center">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-3">
                    Share Your Feedback
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mb-8">
                    We'd love to hear your thoughts or help you with any issues
                    you've encountered.
                </p>

                <form onSubmit={handleSubmit} className="text-left">
                    <div className="mb-5">
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-gray-700 mb-2"
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
                            className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700 mb-2"
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
                            className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="type"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            What is this about?
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
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
                            className="block text-sm font-semibold text-gray-700 mb-2"
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
                            className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[120px]"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-500 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70"
                    >
                        {isSubmitting ? "Sending..." : "Send Feedback"}
                    </button>
                </form>

                {submitMessage && (
                    <div className="mt-4 text-green-600 text-sm">
                        {submitMessage}
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-block px-6 py-2 bg-gray-100 text-gray-800 font-semibold rounded-full shadow-sm hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
                    >
                        🔙 Go Back
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="/survey"
                        className="inline-block px-6 py-2 bg-gray-100 text-gray-800 font-semibold rounded-full shadow-sm hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
                    >
                        📋 Take Our Quick Survey
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;
