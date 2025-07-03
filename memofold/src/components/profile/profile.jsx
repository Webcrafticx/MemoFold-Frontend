import React, { useState } from "react";
import {
    FaPlusCircle,
    FaHeart,
    FaRegHeart,
    FaComment,
    FaShare,
} from "react-icons/fa";
import logo from "../../assets/logo.png";

const ProfilePage = () => {
    const [profilePic, setProfilePic] = useState(
        "https://ui-avatars.com/api/?name=User&background=random"
    );
    const [username] = useState("@your_username");
    const [realName] = useState("Real Name");
    const [bio] = useState("Visual storyteller. Passion meets pixels. ✨");
    const [posts, setPosts] = useState([
        {
            id: 1,
            username: "your_username",
            profilePic:
                "https://ui-avatars.com/api/?name=User&background=random",
            image: "/assets/post1.jpg",
            content:
                "Beautiful sunset views from my trip to Bali last week. The colors were absolutely breathtaking! 🌅 #travel #bali",
            likes: 42,
            isLiked: false,
            comments: 8,
            shares: 3,
        },
        {
            id: 2,
            username: "your_username",
            profilePic:
                "https://ui-avatars.com/api/?name=User&background=random",
            image: "/assets/post2.jpg",
            content:
                "Homemade pasta with fresh ingredients from the farmers market. Nothing beats a home-cooked meal! 🍝 #foodie #homecooking",
            likes: 28,
            isLiked: true,
            comments: 5,
            shares: 2,
        },
    ]);

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleLike = (postId) => {
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
        <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 font-['Inter']">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-50 rounded-b-xl">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <img
                            src={logo}
                            alt="MemoFold Logo"
                            className="h-20 w-20 object-contain rounded-xl"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-2 px-5 rounded-xl hover:from-cyan-500 hover:to-blue-600 hover:scale-105 transition-all">
                        <FaPlusCircle className="text-lg" />
                        Create Post
                    </button>
                </div>
            </nav>

            {/* Profile Section */}
            <div className="max-w-4xl mx-auto my-12 bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 transition-all hover:shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                    <div className="relative">
                        <input
                            type="file"
                            id="profilePicUpload"
                            onChange={handleProfilePicChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <label
                            htmlFor="profilePicUpload"
                            className="cursor-pointer"
                        >
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-blue-400 hover:scale-105 transition-transform"
                            />
                        </label>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            {username}
                        </h2>
                        <p className="text-lg sm:text-xl font-semibold text-gray-600 mt-1">
                            {realName}
                        </p>
                        <p className="text-gray-600 mt-3">{bio}</p>

                        <div className="flex gap-4 mt-6">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                Follow
                            </button>
                            <button className="bg-blue-100 hover:bg-blue-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors">
                                Message
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all cursor-pointer">
                        <span className="text-blue-500">📊</span>
                        <span>42 Posts</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all cursor-pointer">
                        <span className="text-blue-500">👥</span>
                        <span>128 Followers</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all cursor-pointer">
                        <span className="text-blue-500">❤️</span>
                        <span>256 Following</span>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <section className="max-w-2xl mx-auto pb-12 px-4 sm:px-6">
                <div className="space-y-6">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            {/* Post Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={post.profilePic}
                                    alt={post.username}
                                    className="w-10 h-10 rounded-full border border-gray-200"
                                />
                                <span className="font-semibold">
                                    {post.username}
                                </span>
                            </div>

                            {/* Post Content */}
                            <p className="text-gray-700 mb-4">{post.content}</p>

                            {/* Post Image */}
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="w-full rounded-xl mb-4"
                                />
                            )}

                            {/* Post Actions */}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => toggleLike(post.id)}
                                    className={`flex items-center gap-1 ${
                                        post.isLiked
                                            ? "text-red-500"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {post.isLiked ? (
                                        <FaHeart />
                                    ) : (
                                        <FaRegHeart />
                                    )}
                                    <span>{post.likes}</span>
                                </button>

                                <div className="flex items-center gap-1 text-gray-500">
                                    <FaComment />
                                    <span>{post.comments}</span>
                                </div>

                                <div className="flex items-center gap-1 text-gray-500">
                                    <FaShare />
                                    <span>{post.shares}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
