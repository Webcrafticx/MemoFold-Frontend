import React from "react";

const MaintenancePage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-blue-50 to-white font-['Segoe_UI']">
            <div className="text-center max-w-md w-full bg-white border border-blue-100 rounded-xl p-8 sm:p-10 shadow-lg transition-all duration-300 hover:shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-5">
                    🚧 Under Maintenance
                </h1>
                <p className="text-gray-600 text-lg sm:text-xl mb-7 leading-relaxed">
                    We're currently making improvements to enhance your
                    experience.
                    <br />
                    Please check back shortly.
                </p>
                <p className="text-gray-500 italic">— Team MemoFold</p>
            </div>
        </div>
    );
};

export default MaintenancePage;
