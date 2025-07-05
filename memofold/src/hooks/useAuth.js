import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://memofold1.onrender.com/api";

export const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [username, setUsername] = useState(localStorage.getItem("username"));
    const [realname, setRealname] = useState(localStorage.getItem("realname"));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const login = async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
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
            };

            localStorage.setItem("token", userData.token);
            localStorage.setItem("username", userData.username);
            localStorage.setItem("realname", userData.realname);

            setToken(userData.token);
            setUsername(userData.username);
            setRealname(userData.realname);

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
            const response = await fetch(`${API_BASE}/auth/register`, {
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
        navigate("/login");
    };

    const requestPasswordReset = async (email) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/auth/request-reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

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
                `${API_BASE}/auth/reset-password/${token}`,
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

    return {
        token,
        username,
        realname,
        loading,
        error,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
    };
};
