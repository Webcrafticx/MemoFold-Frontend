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

// const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
const STREAM_API_KEY = "jevv5df9tgeq";

// Skeleton Loader Component
const ChatSkeleton = () => {
  return (
    <div className=" bg-white fixed inset-0 flex flex-col">
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

  return `Last seen on ${last.toLocaleDateString()} ${last.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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

  const { 
    data: tokenData, 
    isLoading: tokenLoading, 
    error: tokenError 
  } = useQuery({
    queryKey: ["streamToken", authUser?._id],
    queryFn: async () => {
      if (!token) throw new Error("No auth token");
      return await apiService.getStreamToken(token);
    },
    enabled: !!token && !!authUser?._id,
    retry: 2
  });

  useEffect(() => {
    if (tokenError) {
      console.error("Token error:", tokenError);
      toast.error("Authentication failed. Please login again.");
      setLoading(false);
    }
  }, [tokenError]);

  useEffect(() => {
    if (initializedRef.current) return;
    
    const initChat = async () => {
      if (tokenLoading || !tokenData?.token || !authUser?._id || !targetUserId) return;

      if (authUser._id === targetUserId) {
        toast.error("Cannot start chat with yourself.");
        setLoading(false);
        return;
      }

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          { 
            id: authUser._id, 
            name: authUser.realname || authUser.username, 
            image: authUser.profilePic 
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
        setChannel(currChannel);
        setChatClient(client);
        setLoading(false);
        initializedRef.current = true;
      } catch (err) {
        console.error("Chat init error:", err);
        toast.error("Could not connect to chat");
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [tokenData, authUser, targetUserId, tokenLoading]);

  const handleBack = () => {
    navigate(-1); // Previous page par navigate karega
  };

  const handleVideoCall = async () => {
    if (isSendingCall || !channel) return;
    setIsSendingCall(true);

    try {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      window.open(callUrl, '_blank', 'noopener,noreferrer');
      await channel.sendMessage({
        text: `🔗[Join Now](${callUrl})`, 
        attachments: [
          {
            type: "video_call",
            title: "👥Incoming Video Call",
            description: "Tap below to join the live video session",
            actions: [
              {
                name: "incoming_call",
                text: "Incoming Video Call",
                value: "incoming_call",
                url: callUrl,
              },
            ],
          },
        ],
      });

      toast.success("Video call invitation sent!");
    } catch (error) {
      console.error("Error sending call message:", error);
      toast.error("Failed to send call invitation");
    } finally {
      setIsSendingCall(false);
    }
  };

  if (loading) return <ChatSkeleton />;

  if (!chatClient || !channel) {
    return (
      <div className=" flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat Not Available</h2>
          <p className="text-gray-600">Unable to load chat. Please try again.</p>
        </div>
      </div>
    );
  }

  const targetUser = channel.state.members[targetUserId]?.user;
  const lastSeenText = targetUser?.online
    ? "Online"
    : formatLastSeen(targetUser?.last_active);

  return (
    <div className=" bg-white fixed inset-0">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full h-full flex flex-col">
            {/* ✅ Custom Header with Back Button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
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
                
                {/* User Avatar */}
                <img
                  src={targetUser?.image || "/default-avatar.png"}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                
                {/* User Info */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
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
