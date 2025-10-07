import React from "react";
import { motion } from "framer-motion";

const MainFeedSkeleton = ({ isDarkMode = false }) => {
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
        <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-[#fdfaf6]"}`}>
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

            {/* Posts Skeleton */}
            <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
                {[1, 2, 3, 4].map((post) => (
                    <div
                        key={post}
                        className={`w-full max-w-2xl rounded-xl overflow-hidden ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                        } shadow-lg`}
                    >
                        {/* Post Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <motion.div
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                    className={`h-10 w-10 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                />
                                <div className="space-y-2 flex-1">
                                    <motion.div
                                        variants={shimmerVariants}
                                        initial="initial"
                                        animate="animate"
                                        className={`h-4 w-32 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                    />
                                    <motion.div
                                        variants={shimmerVariants}
                                        initial="initial"
                                        animate="animate"
                                        className={`h-3 w-24 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map((line) => (
                                <motion.div
                                    key={line}
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                    className={`h-4 rounded ${line === 2 ? "w-5/6" : "w-full"} ${
                                        isDarkMode ? "bg-gray-700" : "bg-gray-300"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Post Image */}
                        <motion.div
                            variants={shimmerVariants}
                            initial="initial"
                            animate="animate"
                            className={`h-64 w-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                        />

                        {/* Post Actions */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
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
                                <motion.div
                                    variants={shimmerVariants}
                                    initial="initial"
                                    animate="animate"
                                    className={`h-6 w-20 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                />
                            </div>
                        </div>

                        {/* Comments Preview */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-3">
                                {[1, 2].map((comment) => (
                                    <div key={comment} className="flex space-x-3">
                                        <motion.div
                                            variants={shimmerVariants}
                                            initial="initial"
                                            animate="animate"
                                            className={`h-8 w-8 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                        />
                                        <div className="flex-1 space-y-2">
                                            <motion.div
                                                variants={shimmerVariants}
                                                initial="initial"
                                                animate="animate"
                                                className={`h-3 w-20 rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                            />
                                            <motion.div
                                                variants={shimmerVariants}
                                                initial="initial"
                                                animate="animate"
                                                className={`h-3 w-full rounded ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default MainFeedSkeleton;