import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../services/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// PageLoader Component
const PageLoader = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading call...</p>
      </div>
    </div>
  );
};

const CallPage = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const initializedRef = useRef(false);

  const { user: authUser, token, loading: authLoading } = useAuth();

  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ["streamToken", authUser?._id, channelId],
    queryFn: async () => {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) throw new Error("No auth token found");
      return await apiService.getStreamToken(authToken);
    },
    enabled: !!token && !!channelId,
    retry: 2
  });

  useEffect(() => {
    if (initializedRef.current) return;

    const initCall = async () => {
      if (authLoading || tokenLoading || !tokenData?.token || !authUser || !channelId) {
        return;
      }

      try {
        console.log("🚀 Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.realname || authUser.username,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", channelId);

        // Add stability delay before joining
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await callInstance.join({ create: true });

        console.log("✅ Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
        setIsConnecting(false);
        initializedRef.current = true;
        
      } catch (error) {
        console.error("❌ Error joining call:", error);
        toast.error("Could not join the call");
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, channelId, tokenLoading, authLoading]);

  useEffect(() => {
    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [call, client]);

  if (authLoading || tokenLoading || isConnecting) {
    return <PageLoader />;
  }

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white max-w-md p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 fixed inset-0"> {/* Fixed positioning */}
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <StableCallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center max-w-md p-6">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">Call Failed</h2>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/feed')}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Go to Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stable Call Content Component
const StableCallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      toast.success("Call ended");
      navigate("/feed");
    }
  }, [callingState, navigate]);

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="h-screen flex flex-col">
        {/* Video Area - Fixed height */}
        <div className="flex-1 min-h-0"> {/* Prevents layout shift */}
          <SpeakerLayout />
        </div>
        {/* Controls - Fixed position */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;