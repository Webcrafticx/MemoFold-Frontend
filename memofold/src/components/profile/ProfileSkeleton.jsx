// src/components/profile/ProfileSkeleton.js
import React from "react";
import { motion } from "framer-motion";

const ProfileSkeleton = ({ isDarkMode = false }) => {
    const shimmerVariants = {
        initial: { opacity: 0.7 },
        animate: { 
            opacity: 1,
            transition: {
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse"
            }
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Navbar Skeleton */}
            <div className={`sticky top-0 z-40 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <motion.div 
                            variants={shimmerVariants}
                            initial="initial"
                            animate="animate"
                            className={`h-8 w-32 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                        />
                        <motion.div
                            variants={shimmerVariants}
                            initial="initial"
                            animate="animate"
                            className={`h-8 w-8 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                        />
                    </div>
                </div>
            </div>

            {/* Profile Header Skeleton */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    {/* Profile Picture */}
                    <motion.div
                        variants={shimmerVariants}
                        initial="initial"
                        animate="animate"
                        className={`h-32 w-32 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                    />
                    
                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-2">
                            <motion.div
                                variants={shimmerVariants}
                                initial="initial"
                                animate="animate"
                                className={`h-8 w-48 mx-auto md:mx-0 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                            />
                            <motion.div
                                variants={shimmerVariants}
                                initial="initial"
                                animate="animate"
                                className={`h-6 w-32 mx-auto md:mx-0 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                            />
                        </div>
                        
                        {/* Bio */}
                        <div className="space-y-2">
                            {[1, 2, 3].map((line) => (
                                <motion.div
                                    key={line}
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                    className={`h-4 w-full rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                />
                            ))}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex justify-center md:justify-start space-x-8 pt-4">
                            {[1, 2, 3].map((stat) => (
                                <div key={stat} className="text-center">
                                    <motion.div
                                        variants={shimmerVariants}
                                        initial="initial"
                                        animate="animate"
                                        className={`h-6 w-12 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                    />
                                    <motion.div
                                        variants={shimmerVariants}
                                        initial="initial"
                                        animate="animate"
                                        className={`h-4 w-16 rounded mt-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Section Skeleton */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-8">
                <div className={`rounded-lg p-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
                    <div className="flex space-x-4">
                        <motion.div
                            variants={shimmerVariants}
                            initial="initial"
                            animate="animate"
                            className={`h-10 w-10 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                        />
                        <div className="flex-1 space-y-3">
                            <motion.div
                                variants={shimmerVariants}
                                initial="initial"
                                animate="animate"
                                className={`h-6 w-full rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                            />
                            <motion.div
                                variants={shimmerVariants}
                                initial="initial"
                                animate="animate"
                                className={`h-4 w-3/4 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Skeleton */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
                {[1, 2, 3].map((post) => (
                    <div
                        key={post}
                        className={`rounded-lg overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}
                    >
                        <div className="p-4">
                            <div className="flex items-center space-x-3">
                                <motion.div
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                    className={`h-10 w-10 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                />
                                <div className="space-y-2">
                                    <motion.div
                                        variants={shimmerVariants}
                                        initial="initial"
                                        animate="animate"
                                        className={`h-4 w-24 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                    />
                                    <motion.div
                                        variants={shimmerVariants}
                                        initial="initial"
                                        animate="animate"
                                        className={`h-3 w-16 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-4 pb-4 space-y-3">
                            {[1, 2, 3].map((line) => (
                                <motion.div
                                    key={line}
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                    className={`h-4 w-full rounded ${line === 2 ? "w-5/6" : "w-full"} ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                />
                            ))}
                        </div>

                        <motion.div
                            variants={shimmerVariants}
                            initial="initial"
                            animate="animate"
                            className={`h-64 w-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                        />

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between">
                                <div className="flex space-x-6">
                                    {[1, 2, 3].map((action) => (
                                        <motion.div
                                            key={action}
                                            variants={shimmerVariants}
                                            initial="initial"
                                            animate="animate"
                                            className={`h-6 w-16 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileSkeleton;