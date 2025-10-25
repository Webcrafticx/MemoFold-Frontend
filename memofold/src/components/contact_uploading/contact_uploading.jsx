import React, { useState } from "react";
import emailjs from "emailjs-com";
import logo from "../../assets/logo.png";

const ContactUploading = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        request: "",
        message: "",
    });

    const [status, setStatus] = useState({ type: "", message: "" });

    // handle input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // handle form submit with EmailJS
    const handleSubmit = (e) => {
        e.preventDefault();

        const serviceId = "service_cp3stto"; 
        const templateId = "template_lus8ysf"; 
        const publicKey = "mXPVpyGlN1_awMK1B"; 

        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            request_type: formData.request,
            message: formData.message,
        };

        emailjs.send(serviceId, templateId, templateParams, publicKey)
            .then(() => {
                setStatus({ type: "success", message: " Request sent successfully!" });
                setFormData({ name: "", email: "", request: "", message: "" });
            })
            .catch((error) => {
                console.error("EmailJS Error:", error);
                setStatus({ type: "error", message: " Failed to send request. Try again later." });
            });
    };

    return (
        <div
            className="font-['Inter'] text-gray-800 leading-relaxed min-h-screen flex flex-col"
            style={{
                background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
                backgroundAttachment: "fixed",
                backgroundSize: "cover",
            }}
        >
            {/* Header */}
            <header className="w-full py-3 px-4 sm:px-6 bg-white/90 shadow-sm sticky top-0 z-10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex justify-end">
                    <a
                        href="/login"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-2 px-5 rounded-full text-base hover:from-cyan-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none"
                    >
                        <img src={logo} alt="Login" className="w-6 h-6 rounded-full object-cover" />
                        Log in
                    </a>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
                <div className="max-w-4xl mx-auto bg-white/90 p-6 md:p-10 rounded-2xl shadow-xl my-8 backdrop-blur-sm">
                    {/* Page Header */}
                    <header className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                            🔗 Contact Uploading & Non-User Policy
                        </h1>
                        <p className="text-lg text-gray-600 mb-3">
                            At <strong>MemoFold</strong>, we believe that your
                            connections define your digital story. Whether
                            you've added a friend or discovered a past memory,
                            every interaction matters.
                        </p>
                        <p className="text-lg text-gray-600 mb-3">
                            This page outlines how we use your contact
                            information responsibly, how we treat individuals
                            who are not yet members of our platform, and how we
                            ensure transparency and control are always in your
                            hands.
                        </p>
                        <p className="text-lg text-gray-600">
                            From the moment you sync your contacts, we
                            prioritize safety, consent, and respect — because
                            your trust is our most important connection.
                        </p>
                    </header>

                    {/* Info Section */}
                    <section className="mb-12 space-y-5">
                        <details
                            open
                            className="border border-gray-200 rounded-xl p-5 bg-blue-50/80 open:bg-blue-100/90 open:border-blue-300 transition-colors"
                        >
                            <summary className="font-semibold text-lg cursor-pointer focus:outline-none list-none">
                                📇{" "}
                                <strong>
                                    What is Contact Uploading and Why Do We Use
                                    It?
                                </strong>
                            </summary>
                            <div className="mt-3 space-y-3">
                                <p className="text-gray-700">
                                    Contact uploading is a feature that allows
                                    MemoFold to sync with your address book —
                                    but only with your explicit permission. This
                                    helps you discover friends who are already
                                    on the platform, reconnect with people you
                                    care about, and create meaningful
                                    connections through shared memories and
                                    posts.
                                </p>
                                <p className="text-gray-700">
                                    It's important to note: contact syncing does
                                    not post anything or notify your contacts.
                                    It simply enhances your experience by making
                                    connections easier and more personalized.
                                </p>
                            </div>
                        </details>

                        <details className="border border-gray-200 rounded-xl p-5 bg-blue-50/80 hover:bg-blue-100/90 transition-colors">
                            <summary className="font-semibold text-lg cursor-pointer focus:outline-none list-none">
                                👤{" "}
                                <strong>
                                    How We Respect the Privacy of Non-Members
                                </strong>
                            </summary>
                            <div className="mt-3 space-y-3">
                                <p className="text-gray-700">
                                    Not everyone is on MemoFold — and that's
                                    okay. When you upload contacts that include
                                    people who haven't joined, we never create
                                    profiles for them or store unnecessary data.
                                    Their information is used solely to improve
                                    your experience, such as suggesting people
                                    you may know.
                                </p>
                                <p className="text-gray-700">
                                    We never send invitations or emails to these
                                    individuals on your behalf without your
                                    permission. If a non-user requests removal
                                    from our system, we honor that request
                                    immediately.
                                </p>
                            </div>
                        </details>

                        <details className="border border-gray-200 rounded-xl p-5 bg-blue-50/80 hover:bg-blue-100/90 transition-colors">
                            <summary className="font-semibold text-lg cursor-pointer focus:outline-none list-none">
                                🔒{" "}
                                <strong>
                                    Your Contacts, Your Control — How We Secure
                                    Your Data
                                </strong>
                            </summary>
                            <div className="mt-3 space-y-3">
                                <p className="text-gray-700">
                                    Your contact information is encrypted from
                                    the moment it's uploaded. We follow industry
                                    best practices in data security, and we do
                                    not sell, trade, or share your contact data
                                    with any third parties.
                                </p>
                                <p className="text-gray-700">
                                    You have full control — you can view your
                                    synced contacts, manage visibility, or
                                    delete uploaded data at any time through
                                    your account settings. No hidden steps, no
                                    fine print.
                                </p>
                            </div>
                        </details>
                    </section>

                    {/* Contact Form */}
                    <section className="mt-12">
                        <h2 className="text-2xl font-bold mb-5">📬 Submit a Request or Concern</h2>
                        <p className="text-gray-600 mb-6">
                            Use the form below to delete uploaded data, opt out as a non-user, or simply ask a question.
                        </p>

                        <form className="grid gap-5" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="block font-semibold text-gray-800 mb-1">
                                    Your Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block font-semibold text-gray-800 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="request" className="font-semibold text-gray-800">
                                    Request Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="request"
                                    name="request"
                                    value={formData.request}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="" disabled>Select a type of request</option>
                                    <option value="Delete My Uploaded Contacts">🗑️ Delete My Uploaded Contacts</option>
                                    <option value="Request More Info About Data Use">📘 Request More Info About Data Use</option>
                                    <option value="Remove Me from Contact Database (Non-User)">🚫 Remove Me (Non-User)</option>
                                    <option value="General Privacy Concern or Feedback">✉️ General Privacy Concern or Feedback</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block font-semibold text-gray-800 mb-1">
                                    Additional Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    placeholder="Describe your request in detail (optional)..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full cursor-pointer py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-md hover:from-cyan-500 hover:to-blue-600 transition-colors"
                            >
                                Send Request
                            </button>
                        </form>

                        {status.message && (
                            <p
                                className={`mt-4 text-center font-medium ${
                                    status.type === "success" ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {status.message}
                            </p>
                        )}
                    </section>
                </div>

                <footer className="text-center mt-12 text-sm text-gray-500 pb-8">
                    <p>© 2025 MemoFold. All rights reserved.</p>
                    <p className="mt-1">We don't just connect people. We protect them. Your trust means everything to us.</p>
                </footer>
            </main>
        </div>
    );
};

export default ContactUploading;
