import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const MainFeed = () => {
    // Sample post data - replace with your actual data fetching logic
    const [posts, setPosts] = useState([
        {
            id: 1,
            username: "travel_enthusiast",
            profilePic: "/assets/profile1.jpg",
            image: "/assets/post1.jpg",
            content:
                "Beautiful sunset views from my trip to Bali last week. The colors were absolutely breathtaking! 🌅 #travel #bali",
            likes: 42,
            isLiked: false,
        },
        {
            id: 2,
            username: "food_lover",
            profilePic: "/assets/profile2.jpg",
            image: "/assets/post2.jpg",
            content:
                "Homemade pasta with fresh ingredients from the farmers market. Nothing beats a home-cooked meal! 🍝 #foodie #homecooking",
            likes: 28,
            isLiked: true,
        },
        {
            id: 3,
            username: "urban_explorer",
            profilePic: "/assets/profile3.jpg",
            image: "/assets/post3.jpg",
            content:
                "Exploring hidden alleys and street art in the city today. So much creativity everywhere you look! 🎨 #streetart #explore",
            likes: 15,
            isLiked: false,
        },
    ]);

    const handleLike = (postId) => {
        setPosts(
            posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    };
                }
                return post;
            })
        );
    };

    return (
        <div className="min-h-screen bg-[#fdfaf6] font-['Inter']">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900 tracking-wide">
                    MemoFold
                </h1>
                <nav className="flex gap-5">
                    <a
                        href="/home"
                        className="text-gray-600 font-medium hover:text-blue-500"
                    >
                        Home
                    </a>
                    <a
                        href="/profile"
                        className="text-gray-600 font-medium hover:text-blue-500"
                    >
                        My Profile
                    </a>
                    <a
                        href="/logout"
                        className="text-gray-600 font-medium hover:text-blue-500"
                    >
                        Logout
                    </a>
                </nav>
            </header>

            {/* Posts Grid */}
            <section className="py-10 px-4 sm:px-6 flex flex-col items-center gap-8">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="w-full max-w-2xl bg-white rounded-2xl p-5 shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={post.profilePic}
                                alt={post.username}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <h3 className="text-base font-semibold text-gray-800">
                                {post.username}
                            </h3>
                        </div>

                        {/* Post Image */}
                        <img
                            src={post.image}
                            alt="Post"
                            className="w-full rounded-xl mb-3"
                        />

                        {/* Post Content */}
                        <p className="text-gray-700 leading-relaxed mb-3">
                            {post.content}
                        </p>

                        {/* Like Section */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-1 ${
                                    post.isLiked
                                        ? "text-red-500"
                                        : "text-gray-400"
                                }`}
                            >
                                {post.isLiked ? (
                                    <FaHeart className="text-xl animate-pulse" />
                                ) : (
                                    <FaRegHeart className="text-xl hover:text-red-500" />
                                )}
                                <span className="text-sm font-medium text-gray-600">
                                    {post.likes} likes
                                </span>
                            </button>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default MainFeed;
