import React from "react";
import logo from "../../assets/logo.png";

const Logo = ({ darkMode, navigateToMain }) => {
    return (
        <button
            className="flex items-center space-x-2 cursor-pointer"
            onClick={navigateToMain}
        >
            <img
                src={logo}
                alt="MemoFold"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
            />
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                MemoFold
            </span>
        </button>
    );
};

export default Logo;
