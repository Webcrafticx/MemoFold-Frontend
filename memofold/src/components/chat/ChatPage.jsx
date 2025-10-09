import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../services/api";
import { Channel, ChannelHeader, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

// Import the CSS for stream-chat-react
import "stream-chat-react/dist/css/v2/index.css";
import ChatLoader from "./ChatLoader";
import CallButton from "./CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSendingCall, setIsSendingCall] = useState(false);
  const { user: authUser, token } = useAuth();
  
  // Use refs to track initialization
  const initializedRef = useRef(false);
  const clientRef = useRef(null);

  // Stream token fetch
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

  // Handle errors
  useEffect(() => {
    if (tokenError) {
      console.error("Token error:", tokenError);
      toast.error("Authentication failed. Please login again.");
      setLoading(false);
    }
  }, [tokenError]);

  // Chat initialization - FIXED VERSION
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return;
    
    const initChat = async () => {
      if (tokenLoading) return;
      
      if (!tokenData?.token || !authUser?._id || !targetUserId) {
        setLoading(false);
        return;
      }

      if (authUser._id === targetUserId) {
        toast.error("Cannot start chat with yourself.");
        setLoading(false);
        return;
      }

      try {
        // Disconnect existing client if any
        if (clientRef.current) {
          await clientRef.current.disconnectUser();
        }

        const client = StreamChat.getInstance(STREAM_API_KEY);
        clientRef.current = client;
        
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
          name: `Chat between ${authUser.realname || authUser.username} and ${targetUserId}`,
          created_by_id: authUser._id,
        });

        await currChannel.watch();
        
        setChannel(currChannel);
        setChatClient(client);
        setLoading(false);
        initializedRef.current = true;
        
      } catch (err) {
        console.error("Chat init error:", err);
        
        if (err.message.includes("user")) {
          toast.error("User not found. Please check if the user exists.");
        } else if (err.message.includes("channel")) {
          toast.error("Could not create chat channel. Please try again.");
        } else if (err.message.includes("permission") || err.message.includes("auth")) {
          toast.error("Authentication error. Please login again.");
        } else {
          toast.error("Could not connect to chat");
        }
        setLoading(false);
      }
    };

    initChat();

    return () => {
      // Cleanup on unmount - but don't disconnect immediately
      // Let React components handle their own cleanup
    };
  }, [tokenData, authUser, targetUserId, tokenLoading]);

  const handleVideoCall = async () => {
    if (isSendingCall) return;
    
    if (!channel) {
      toast.error("Chat channel not ready");
      return;
    }

    setIsSendingCall(true);
    
    try {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      
      // Call invitation send karein with clickable link
      await channel.sendMessage({
        text: `🎥 **Video Call Invitation**\n\nClick here to join the video call: ${callUrl}`,
      });

      toast.success("Video call link sent! Click the link in chat to join.");
      
    } catch (error) {
      console.error("Error sending call message:", error);
      toast.error("Failed to send call invitation: " + error.message);
    } finally {
      setIsSendingCall(false);
    }
  };

  if (loading || !chatClient || !channel) {
    return <ChatLoader />;
  }

  return (
    <div className="h-[93vh] bg-white">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full h-full relative flex">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              <CallButton handleVideoCall={handleVideoCall} isSending={isSendingCall} />
              <Window>
                <div className="str-chat__main-panel h-full">
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput focus />
                </div>
              </Window>
            </div>
            
            {/* Thread Sidebar */}
            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;