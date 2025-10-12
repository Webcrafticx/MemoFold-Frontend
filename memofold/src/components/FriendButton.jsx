import React, { useState, useEffect } from "react";
import {
    FaUserPlus,
    FaUserCheck,
    FaUserClock,
    FaSpinner,
} from "react-icons/fa";
import config from "../hooks/config";

const FriendButton = ({ targetUserId, currentUserId }) => {
    const [buttonState, setButtonState] = useState("loading");
    const [isLoading, setIsLoading] = useState(false);

    const checkRelationshipStatus = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setButtonState("add");
                return;
            }

            let isFriend = false;
            let isRequestSent = false;

            try {
                const friendsResponse = await fetch(
                    `${config.apiUrl}/friends/friends-list?limit=100`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (friendsResponse.ok) {
                    const friendsData = await friendsResponse.json();
                    const friendsList = friendsData.friends || [];
                    isFriend = friendsList.some(
                        (friend) => friend._id === targetUserId
                    );
                }
            } catch (friendsError) {
                // Silent fail - proceed to next check
            }

            if (!isFriend) {
                try {
                    const userResponse = await fetch(
                        `${config.apiUrl}/user/me`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        const currentUser = userData.user;
                        isRequestSent = currentUser.sentrequests?.some(
                            (request) =>
                                request.to === targetUserId &&
                                request.status === "pending"
                        );
                    }
                } catch (userError) {
                    // Silent fail - proceed with default state
                }
            }

            if (isFriend) {
                setButtonState("remove");
            } else if (isRequestSent) {
                setButtonState("cancel");
            } else {
                setButtonState("add");
            }
        } catch (error) {
            setButtonState("add");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFriend = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${config.apiUrl}/friends/friend-request/${targetUserId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                setButtonState("cancel");
                setTimeout(() => checkRelationshipStatus(), 1000);
            } else {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to send friend request"
                );
            }
        } catch (error) {
            alert(error.message || "Failed to send friend request");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${config.apiUrl}/friends/friend-request/${targetUserId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                setButtonState("add");
                setTimeout(() => checkRelationshipStatus(), 1000);
            } else {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to cancel friend request"
                );
            }
        } catch (error) {
            alert(error.message || "Failed to cancel friend request");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFriend = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${config.apiUrl}/friends/remove-friend/${targetUserId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                setButtonState("add");
                setTimeout(() => checkRelationshipStatus(), 1000);
            } else {
                const errorText = await response.text();
                let errorMessage = "Failed to remove friend";
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            alert(error.message || "Failed to remove friend");
        } finally {
            setIsLoading(false);
        }
    };

    const handleButtonClick = () => {
        if (isLoading) return;

        switch (buttonState) {
            case "add":
                handleAddFriend();
                break;
            case "cancel":
                handleCancelRequest();
                break;
            case "remove":
                handleRemoveFriend();
                break;
            default:
                break;
        }
    };

    const getButtonConfig = () => {
        switch (buttonState) {
            case "add":
                return {
                    icon: <FaUserPlus size={18} />,
                    className:
                        "bg-blue-400 hover:bg-blue-500 text-white shadow-sm hover:shadow-md",
                    title: "Add Friend",
                };
            case "cancel":
                return {
                    icon: <FaUserClock size={18} />,
                    className:
                        "bg-amber-400 hover:bg-amber-500 text-white shadow-sm hover:shadow-md",
                    title: "Cancel Request",
                };
            case "remove":
                return {
                    icon: <FaUserCheck size={18} />,
                    className:
                        "bg-rose-400 hover:bg-rose-500 text-white shadow-sm hover:shadow-md",
                    title: "Remove Friend",
                };
            case "loading":
                return {
                    icon: <FaSpinner size={18} className="animate-spin" />,
                    className: "bg-gray-300 cursor-not-allowed",
                    title: "Loading",
                };
            default:
                return {
                    icon: <FaUserPlus size={18} />,
                    className:
                        "bg-blue-400 hover:bg-blue-500 text-white shadow-sm hover:shadow-md",
                    title: "Add Friend",
                };
        }
    };

    useEffect(() => {
        if (targetUserId && currentUserId) {
            checkRelationshipStatus();
        } else {
            setButtonState("add");
        }
    }, [targetUserId, currentUserId]);

    const buttonConfig = getButtonConfig();

    return (
        <button
            onClick={handleButtonClick}
            disabled={isLoading || buttonState === "loading"}
            className={`flex items-center justify-center p-3 rounded-full font-medium transition-all duration-200 ${
                buttonConfig.className
            } ${
                isLoading
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:scale-105"
            }`}
            title={buttonConfig.title}
        >
            {isLoading ? (
                <FaSpinner size={18} className="animate-spin" />
            ) : (
                buttonConfig.icon
            )}
        </button>
    );
};

export default FriendButton;
