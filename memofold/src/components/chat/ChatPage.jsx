import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../services/api";
import { Channel, Chat, MessageInput, MessageList } from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import "stream-chat-react/dist/css/v2/index.css";
import CallButton from "./CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// 🟡 Skeleton Loader
const ChatSkeleton = () => (
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
  const [isSendingCall, setIsSendingCall] = useState(false);
  const { user: authUser, token } = useAuth();
  const initializedRef = useRef(false);
  const reloadAttemptedRef = useRef(false); // track reload

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken", authUser?._id],
    queryFn: async () => {
      if (!token) throw new Error("No auth token");
      return await apiService.getStreamToken(token);
    },
    enabled: !!token && !!authUser?._id,
    retry: 1,
  });

  const initChat = async () => {
    if (tokenLoading || !tokenData?.token || !authUser?._id || !targetUserId) return;

    if (authUser._id === targetUserId) {
      setLoading(false);
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
    } catch (err) {
      console.error("Chat init error:", err);
      setLoading(false);

      // 🔄 Automatically reload once
      if (!reloadAttemptedRef.current) {
        reloadAttemptedRef.current = true;
        setTimeout(() => {
          window.location.reload();
        }, 1000); // 1 second delay
      } else {
        toast.error("Unable to initialize chat. Please reload the page manually.");
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

  const navigateToUserProfile = (userId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!userId) return;
    navigate(userId === authUser._id ? "/profile" : `/user/${userId}`);
  };

  if (loading) return <ChatSkeleton />;

  const targetUser = channel?.state?.members[targetUserId]?.user;
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
