import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../services/api";
import { Channel, Chat, MessageInput, MessageList } from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import "stream-chat-react/dist/css/v2/index.css";
import ChatLoader from "./ChatLoader";
import CallButton from "./CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// 🟡 Skeleton Loader
const ChatSkeleton = () => {
  return (
    <div className="bg-white fixed inset-0 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-6 overflow-hidden"></div>
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const formatLastSeen = (lastActive) => {
  if (!lastActive) return "Offline";
  const last = new Date(lastActive);
  const now = new Date();
  const diff = Math.floor((now - last) / 1000);

  if (diff < 60) return "Active just now";
  if (diff < 3600) return `Last seen ${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `Last seen ${Math.floor(diff / 3600)} hrs ago`;

  return `Last seen on ${last.toLocaleDateString()} ${last.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadAttempted, setReloadAttempted] = useState(false);
  const [isSendingCall, setIsSendingCall] = useState(false);
  const [initFailed, setInitFailed] = useState(false);
  const { user: authUser, token } = useAuth();
  const initializedRef = useRef(false);

  const {
    data: tokenData,
    isLoading: tokenLoading,
    error: tokenError,
  } = useQuery({
    queryKey: ["streamToken", authUser?._id],
    queryFn: async () => {
      if (!token) throw new Error("No auth token");
      return await apiService.getStreamToken(token);
    },
    enabled: !!token && !!authUser?._id,
    retry: 1,
  });

  useEffect(() => {
    if (tokenError) {
      console.error("Token error:", tokenError);
      setLoading(false);
      setInitFailed(true);
    }
  }, [tokenError]);

  const initChat = async () => {
    if (tokenLoading || !tokenData?.token || !authUser?._id || !targetUserId) return;

    if (authUser._id === targetUserId) {
      setLoading(false);
      setInitFailed(true);
      return;
    }

    try {
      const client = StreamChat.getInstance(STREAM_API_KEY);
      await client.connectUser(
        {
          id: authUser._id,
          name: authUser.realname || authUser.username,
          image: authUser.profilePic,
        },
        tokenData.token
      );

      const channelId = [authUser._id, targetUserId].sort().join("-");
      const currChannel = client.channel("messaging", channelId, {
        members: [authUser._id, targetUserId],
        name: `Chat with ${targetUserId}`,
        created_by_id: authUser._id,
      });

      await currChannel.watch();
      await currChannel.addMembers([authUser._id, targetUserId]);

      setChannel(currChannel);
      setChatClient(client);
      setLoading(false);
      initializedRef.current = true;
      setInitFailed(false);
    } catch (err) {
      console.error("Chat init error:", err);
      const statusCode = err?.response?.status;
      if (statusCode === 400) {
        setLoading(false);
        setInitFailed(true);
        toast.error("Failed to initialize chat (400). Please try again.");
        return;
      }
      if (!reloadAttempted) {
        setReloadAttempted(true);
        window.location.reload();
      } else {
        setLoading(false);
        setInitFailed(true);
      }
    }
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initChat();
    return () => {
      if (chatClient) chatClient.disconnectUser();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenData, authUser, targetUserId, tokenLoading]);

  const handleBack = () => navigate(-1);

  const handleVideoCall = async () => {
    if (isSendingCall || !channel) return;
    setIsSendingCall(true);

    try {
      const relativeUrl = `/call/${channel.id}`;
      const fullUrl = `${window.location.origin}${relativeUrl}`;

      await channel.sendMessage({
        text: `🔗[Join Now](${fullUrl})`,
        attachments: [
          {
            type: "video_call",
            title: "👥 Incoming Video Call",
            description: "Tap below to join the live video session",
            actions: [
              {
                name: "incoming_call",
                text: "Incoming Video Call",
                value: "incoming_call",
              },
            ],
          },
        ],
      });

      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error sending call message:", error);
    } finally {
      setIsSendingCall(false);
    }
  };

  const handleRetry = () => {
    setInitFailed(false);
    setLoading(true);
    setReloadAttempted(false);
    initChat();
  };

  // ✅ Navigate to user profile
  const navigateToUserProfile = (userId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!userId) return;

    if (userId === authUser._id) {
      navigate("/profile");
    } else {
      navigate(`/user/${userId}`);
    }
  };

  if (loading) return <ChatSkeleton />;

  if (initFailed || !chatClient || !channel) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm">
          <div className="animate-bounce text-5xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Reconnecting...
          </h2>
          <p className="text-gray-600 mb-6">Something went wrong while connecting to the chat.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
            <button
              onClick={handleRetry}
              className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const targetUser = channel.state.members[targetUserId]?.user;
  const lastSeenText = targetUser?.online
    ? "Online"
    : formatLastSeen(targetUser?.last_active);

  return (
    <div className="bg-white fixed inset-0">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Go back"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Avatar + Username Clickable */}
                <div
                  onClick={(e) => navigateToUserProfile(targetUser?.id, e)}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  {targetUser?.image ? (
                    <img
                      src={targetUser.image}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-blue-500 transition"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                      {targetUser?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {targetUser?.name || "User"}
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center">
                      {targetUser?.online && (
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      )}
                      {lastSeenText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call Button */}
              <CallButton handleVideoCall={handleVideoCall} isSending={isSendingCall} />
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0">
              <MessageList />
            </div>

            {/* Input */}
            <MessageInput focus />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
