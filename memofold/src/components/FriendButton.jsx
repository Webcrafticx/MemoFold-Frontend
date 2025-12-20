import React, { useEffect, useState } from "react";
import {
    FaUserPlus,
    FaUserCheck,
    FaUserClock,
    FaSpinner,
} from "react-icons/fa";
import config from "../hooks/config";
import ConfirmationModal from "../common/ConfirmationModal";

const FriendButton = ({
    targetUserId,
    initialState = "loading", // 👈 coming from UserProfile
}) => {
    const [buttonState, setButtonState] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    // 🔥 Sync whenever parent updates status
    useEffect(() => {
        setButtonState(initialState);
    }, [initialState]);

    const token = localStorage.getItem("token");

    /* ------------------ ACTION HANDLERS ------------------ */

    const handleAddFriend = async () => {
        if (!token) return;

        try {
            setIsLoading(true);

            const res = await fetch(
                `${config.apiUrl}/friends/friend-request/${targetUserId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) throw new Error("Failed to send request");

            // optimistic update
            setButtonState("cancel");
        } catch (err) {
            alert(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!token) return;

        try {
            setIsLoading(true);

            const res = await fetch(
                `${config.apiUrl}/friends/friend-request/${targetUserId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) throw new Error("Failed to cancel request");

            setButtonState("add");
        } catch (err) {
            alert(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (!token) return;

        try {
            setIsLoading(true);

            const res = await fetch(
                `${config.apiUrl}/friends/remove-friend/${targetUserId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!res.ok) throw new Error("Failed to remove friend");

            setButtonState("add");
        } catch (err) {
            alert(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    /* ------------------ UI HELPERS ------------------ */

    const getButtonConfig = () => {
        switch (buttonState) {
            case "add":
                return {
                    icon: <FaUserPlus size={14} />,
                    text: "Add Friend",
                    className: "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer",
                };
            case "cancel":
                return {
                    icon: <FaUserClock size={14} />,
                    text: "Cancel Request",
                    className: "bg-amber-500 hover:bg-amber-600 text-white cursor-pointer",
                };
            case "remove":
                return {
                    icon: <FaUserCheck size={14} />,
                    text: "Remove Friend",
                    className: "bg-green-500 hover:bg-green-600 text-white cursor-pointer",
                };
            default:
                return {
                    icon: <FaSpinner size={14} className="animate-spin" />,
                    text: "Loading",
                    className: "bg-gray-400 cursor-pointer" ,
                };
        }
    };

    const handleClick = () => {
        if (isLoading) return;

        if (buttonState === "add") handleAddFriend();
        if (buttonState === "cancel") setShowCancelModal(true);
        if (buttonState === "remove") setShowRemoveModal(true);
    };

    const btn = getButtonConfig();

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isLoading || buttonState === "loading"}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                    btn.className
                } ${
                    isLoading
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:opacity-90"
                }`}
            >
                {isLoading ? (
                    <FaSpinner size={14} className="animate-spin" />
                ) : (
                    btn.icon
                )}
                <span>{btn.text}</span>
            </button>

            {/* Cancel Request Modal */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => {
                    setShowCancelModal(false);
                    handleCancelRequest();
                }}
                title="Cancel Friend Request"
                message="Are you sure you want to cancel this request?"
                confirmText="Yes, Cancel"
                cancelText="Keep"
                type="warning"
                isLoading={isLoading}
            />

            {/* Remove Friend Modal */}
            <ConfirmationModal
                isOpen={showRemoveModal}
                onClose={() => setShowRemoveModal(false)}
                onConfirm={() => {
                    setShowRemoveModal(false);
                    handleRemoveFriend();
                }}
                title="Remove Friend"
                message="This will remove the user from your friends list."
                confirmText="Remove"
                cancelText="Cancel"
                type="delete"
                isLoading={isLoading}
            />
        </>
    );
};

export default FriendButton;
