import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../services/api";
import { Channel, ChannelHeader, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: authUser, token } = useAuth();

  const { data: tokenData, isLoading: tokenLoading, error: tokenError, refetch } = useQuery({
    queryKey: ["streamToken", authUser?._id],
    queryFn: async () => {
      if (!token) throw new Error("No auth token");
      return await apiService.getStreamToken(token);
    },
    enabled: !!token && !!authUser?._id
  });

  const { data: targetUserData } = useQuery({
    queryKey: ["targetUser", targetUserId],
    queryFn: async () => {
      if (!token || !targetUserId) throw new Error("Missing token or target user ID");
      return await apiService.getUserById(targetUserId, token);
    },
    enabled: !!token && !!targetUserId && !!authUser?._id
  });

  useEffect(() => {
    if (tokenError) {
      toast.error("Authentication failed. Please login again.");
      setError(tokenError.message);
      setLoading(false);
    }
  }, [tokenError]);

  useEffect(() => {
    const initChat = async () => {
      if (tokenLoading) return;
      if (!tokenData?.token || !authUser?._id || !targetUserId || !targetUserData) return;

      if (authUser._id === targetUserId) {
        setError("Cannot start chat with yourself.");
        setLoading(false);
        return;
      }

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          { id: authUser._id, name: authUser.realname || authUser.username, image: authUser.profilePic },
          tokenData.token
        );

        // ✅ Ensure both users exist BEFORE creating channel
        await apiService.ensureUsersExist(token, [
          { id: authUser._id, name: authUser.realname || authUser.username },
          { id: targetUserId, name: targetUserData?.realname || targetUserData?.username || "User" }
        ]);

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
          name: `Chat between ${authUser.realname || authUser.username} and ${targetUserData?.realname || "User"}`
        });

        await currChannel.watch();
        setChannel(currChannel);
        setChatClient(client);
        setLoading(false);
      } catch (err) {
        console.error("Chat init error:", err);
        setError(err.message || "Could not connect to chat");
        setLoading(false);
      }
    };

    initChat();
    return () => chatClient?.disconnectUser().catch(console.error);
  }, [tokenData, authUser, targetUserId, targetUserData, token]);

  if (loading) return <div className="flex justify-center items-center h-[93vh]">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!chatClient || !channel) return <div className="text-center mt-10">Chat not ready</div>;

  return (
    <Chat client={chatClient}>
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput focus />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
};

export default ChatPage;