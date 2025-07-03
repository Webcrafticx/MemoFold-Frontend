import React from "react";
import logo from "../../assets/logo.png";

const ContactUploading = () => {
    return (
        <div className="font-['Inter'] bg-gradient-to-br from-cyan-50 to-white text-gray-800 leading-relaxed p-5 min-h-screen">
            {/* Top Bar */}
            <header className="flex justify-end items-center py-3 px-6 bg-gray-50 shadow-sm relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 md:static md:transform-none">
                    <a
                        href="#"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-2 px-5 rounded-full text-base hover:from-cyan-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none"
                    >
                        <img
                            src={logo}
                            alt="Login"
                            className="w-7 h-7 rounded-full object-cover"
                        />
                        Log in
                    </a>
                </div>
            </header>

            {/* Main Container */}
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-xl my-8">
                {/* Page Header */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                        🔗 Contact Uploading & Non-User Policy
                    </h1>
                    <p className="text-lg text-gray-600 mb-3">
                        At <strong>MemoFold</strong>, we believe that your
                        connections define your digital story. Whether you've
                        added a friend or discovered a past memory, every
                        interaction matters.
                    </p>
                    <p className="text-lg text-gray-600 mb-3">
                        This page outlines how we use your contact information
                        responsibly, how we treat individuals who are not yet
                        members of our platform, and how we ensure transparency
                        and control are always in your hands.
                    </p>
                    <p className="text-lg text-gray-600">
                        From the moment you sync your contacts, we prioritize
                        safety, consent, and respect — because your trust is our
                        most important connection.
                    </p>
                </header>

                {/* Info Section */}
                <section className="mb-12">
                    <details
                        open
                        className="mb-5 border border-gray-200 rounded-xl p-5 bg-blue-50 open:bg-blue-100 open:border-blue-300"
                    >
                        <summary className="font-semibold text-lg cursor-pointer focus:outline-none">
                            📇{" "}
                            <strong>
                                What is Contact Uploading and Why Do We Use It?
                            </strong>
                        </summary>
                        <div className="mt-3 space-y-3">
                            <p className="text-gray-700">
                                Contact uploading is a feature that allows
                                MemoFold to sync with your address book — but
                                only with your explicit permission. This helps
                                you discover friends who are already on the
                                platform, reconnect with people you care about,
                                and create meaningful connections through shared
                                memories and posts.
                            </p>
                            <p className="text-gray-700">
                                It's important to note: contact syncing does not
                                post anything or notify your contacts. It simply
                                enhances your experience by making connections
                                easier and more personalized.
                            </p>
                        </div>
                    </details>

                    <details className="mb-5 border border-gray-200 rounded-xl p-5 bg-blue-50">
                        <summary className="font-semibold text-lg cursor-pointer focus:outline-none">
                            👤{" "}
                            <strong>
                                How We Respect the Privacy of Non-Members
                            </strong>
                        </summary>
                        <div className="mt-3 space-y-3">
                            <p className="text-gray-700">
                                Not everyone is on MemoFold — and that's okay.
                                When you upload contacts that include people who
                                haven't joined, we never create profiles for
                                them or store unnecessary data. Their
                                information is used solely to improve your
                                experience, such as suggesting people you may
                                know.
                            </p>
                            <p className="text-gray-700">
                                We never send invitations or emails to these
                                individuals on your behalf without your
                                permission. If a non-user requests removal from
                                our system, we honor that request immediately.
                            </p>
                        </div>
                    </details>

                    <details className="mb-5 border border-gray-200 rounded-xl p-5 bg-blue-50">
                        <summary className="font-semibold text-lg cursor-pointer focus:outline-none">
                            🔒{" "}
                            <strong>
                                Your Contacts, Your Control — How We Secure Your
                                Data
                            </strong>
                        </summary>
                        <div className="mt-3 space-y-3">
                            <p className="text-gray-700">
                                Your contact information is encrypted from the
                                moment it's uploaded. We follow industry best
                                practices in data security, and we do not sell,
                                trade, or share your contact data with any third
                                parties.
                            </p>
                            <p className="text-gray-700">
                                You have full control — you can view your synced
                                contacts, manage visibility, or delete uploaded
                                data at any time through your account settings.
                                No hidden steps, no fine print.
                            </p>
                        </div>
                    </details>
                </section>

                {/* Form Section */}
                <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-5">
                        📬 Submit a Request or Concern
                    </h2>
                    <p className="text-gray-600 mb-3">
                        Whether you're a registered user or someone listed in an
                        uploaded contact list, we're here to support your rights
                        and respond to your concerns.
                    </p>
                    <p className="text-gray-600 mb-6">
                        Use the form below to delete uploaded data, opt out as a
                        non-user, or simply ask a question. Your voice matters —
                        and we listen.
                    </p>

                    <form className="grid gap-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="font-semibold text-gray-800"
                            >
                                Your Full Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="e.g. FirstName_SecondName"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="font-semibold text-gray-800"
                            >
                                Email Address{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@example.com"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="request"
                                className="font-semibold text-gray-800"
                            >
                                Request Type{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="request"
                                name="request"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select a type of request
                                </option>
                                <option value="delete">
                                    🗑️ Delete My Uploaded Contacts
                                </option>
                                <option value="info">
                                    📘 Request More Info About Data Use
                                </option>
                                <option value="non-user">
                                    🚫 Remove Me from Contact Database
                                    (Non-User)
                                </option>
                                <option value="general">
                                    ✉️ General Privacy Concern or Feedback
                                </option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="message"
                                className="font-semibold text-gray-800"
                            >
                                Additional Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                placeholder="Describe your request in detail (optional)..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-md hover:from-cyan-500 hover:to-blue-600 transition-colors"
                        >
                            Send Request
                        </button>
                    </form>
                </section>
            </div>

            {/* Footer */}
            <footer className="text-center mt-12 text-sm text-gray-500 pb-8">
                <p>© 2025 MemoFold.</p>
                <p className="mt-1">
                    We don't just connect people. We protect them. Your trust
                    means everything to us.
                </p>
            </footer>
        </div>
    );
};

export default ContactUploading;
