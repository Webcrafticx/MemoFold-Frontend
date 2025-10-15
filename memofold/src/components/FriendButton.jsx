import React, { useState, useEffect } from "react";
import {
    FaUserPlus,
    FaUserCheck,
    FaUserClock,
    FaSpinner,
} from "react-icons/fa";
import config from "../hooks/config";
import ConfirmationModal from "../common/ConfirmationModal";

const FriendButton = ({ targetUserId, currentUserId }) => {
    const [buttonState, setButtonState] = useState("loading");
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

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
                setShowCancelModal(true);
                break;
            case "remove":
                setShowRemoveModal(true);
                break;
            default:
                break;
        }
    };

    // Confirmation handlers
    const confirmCancelRequest = () => {
        setShowCancelModal(false);
        handleCancelRequest();
    };

    const confirmRemoveFriend = () => {
        setShowRemoveModal(false);
        handleRemoveFriend();
    };

    const getButtonConfig = () => {
        switch (buttonState) {
            case "add":
                return {
                    icon: <FaUserPlus size={14} className="mr-1" />,
                    text: "Add Friend",
                    className: "bg-blue-500 hover:bg-blue-600 text-white",
                };
            case "cancel":
                return {
                    icon: <FaUserClock size={14} className="mr-1" />,
                    text: "Cancel Request",
                    className: "bg-amber-500 hover:bg-amber-600 text-white",
                };
            case "remove":
                return {
                    icon: <FaUserCheck size={14} className="mr-1" />,
                    text: "Remove Friend",
                    className: "bg-green-500 hover:bg-green-600 text-white",
                };
            case "loading":
                return {
                    icon: <FaSpinner size={14} className="animate-spin mr-1" />,
                    text: "Loading",
                    className: "bg-gray-400 cursor-not-allowed",
                };
            default:
                return {
                    icon: <FaUserPlus size={14} className="mr-1" />,
                    text: "Add Friend",
                    className: "bg-blue-500 hover:bg-blue-600 text-white",
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
        <>
            {/* Text Button */}
            <button
                onClick={handleButtonClick}
                disabled={isLoading || buttonState === "loading"}
                className={`flex items-center gap-2 px-3 py-1.5  rounded-xl  transition-all duration-200 text-xs sm:text-sm font-medium ${
                    buttonConfig.className
                } ${
                    isLoading || buttonState === "loading"
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer hover:opacity-90"
                }`}
                title={buttonConfig.text}
            >
                {isLoading ? (
                    <FaSpinner size={14} className="animate-spin" />
                ) : (
                    buttonConfig.icon
                )}
                <span>{buttonConfig.text}</span>
            </button>

            {/* Cancel Request Confirmation Modal */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancelRequest}
                title="Cancel Friend Request"
                message="Are you sure you want to cancel this friend request?"
                confirmText="Yes, Cancel Request"
                cancelText="Keep Request"
                type="warning"
                isLoading={isLoading}
            />

            {/* Remove Friend Confirmation Modal */}
            <ConfirmationModal
                isOpen={showRemoveModal}
                onClose={() => setShowRemoveModal(false)}
                onConfirm={confirmRemoveFriend}
                title="Remove Friend"
                message="Are you sure you want to remove this friend? This action cannot be undone."
                confirmText="Yes, Remove Friend"
                cancelText="Keep Friend"
                type="delete"
                isLoading={isLoading}
            />
        </>
    );
};

export default FriendButton;
