import { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "./config";

export const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [username, setUsername] = useState(localStorage.getItem("username"));
    const [realname, setRealname] = useState(localStorage.getItem("realname"));
    const [userId, setUserId] = useState(localStorage.getItem("userId"));
    const [profilePic, setProfilePic] = useState(
        localStorage.getItem("profilePic")
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const login = async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password.trim(),
                }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || "Login failed");
            }

            // Handle demo user specifically
            const isDemoUser = username.trim() === "demo@memofold.com";
            const userData = {
                token: data.token,
                username: data.username || username.trim(),
                realname: data.realname || (isDemoUser ? "Demo User" : "User"),
                userId: data.userId || data._id,
                profilePic: data.profilePic || null,
            };

            localStorage.setItem("token", userData.token);
            localStorage.setItem("username", userData.username);
            localStorage.setItem("realname", userData.realname);
            localStorage.setItem("userId", userData.userId);
            if (userData.profilePic) {
                localStorage.setItem("profilePic", userData.profilePic);
            }

            setToken(userData.token);
            setUsername(userData.username);
            setRealname(userData.realname);
            setUserId(userData.userId);
            setProfilePic(userData.profilePic);

            navigate("/dashboard");
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (realname, username, email, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.apiUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ realname, username, email, password }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || data.error || "Registration failed"
                );
            }

            localStorage.setItem("username", username);
            localStorage.setItem("realname", realname);
            setUsername(username);
            setRealname(realname);

            navigate("/login");
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setUsername(null);
        setRealname(null);
        setUserId(null);
        setProfilePic(null);
        navigate("/login");
    };

    const requestPasswordReset = async (email) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${config.apiUrl}/auth/request-reset`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Reset request failed");
            }

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (token, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${config.apiUrl}/auth/reset-password/${token}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Reset failed");
            }

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Add a method to update user profile data
    const updateUserProfile = (userData) => {
        if (userData._id) {
            localStorage.setItem("userId", userData._id);
            setUserId(userData._id);
        }
        if (userData.profilePic) {
            localStorage.setItem("profilePic", userData.profilePic);
            setProfilePic(userData.profilePic);
        }
        if (userData.realname) {
            localStorage.setItem("realname", userData.realname);
            setRealname(userData.realname);
        }
        if (userData.username) {
            localStorage.setItem("username", userData.username);
            setUsername(userData.username);
        }
    };

    return {
        token,
        username,
        realname,
        userId,
        profilePic,
        loading,
        error,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        updateUserProfile,
        user: {
            // Return a user object for convenience
            _id: userId,
            username,
            realname,
            profilePic,
        },
    };
};
