import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../../hooks/useAuth"; // useAuth import karo
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
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Loading call...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we connect you</p>
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

  // useAuth hook use karo - yeh tumhara existing auth hook hai
  const { user: authUser, token, loading: authLoading } = useAuth();

  // Use apiService for Stream token - authUser ki jagah direct token use karo
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

  // Handle token error
  useEffect(() => {
    if (tokenError) {
      console.error("Token error:", tokenError);
      toast.error("Authentication failed. Please login again.");
      navigate('/login');
    }
  }, [tokenError, navigate]);

  // Call initialization
  useEffect(() => {
    const initCall = async () => {
      if (authLoading || tokenLoading || !tokenData?.token || !authUser || !channelId) {
        return;
      }

      try {
        console.log("Initializing Stream video client...", { 
          channelId, 
          userId: authUser._id 
        });

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

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
        setIsConnecting(false);
        
      } catch (error) {
        console.error("Error joining call:", error);
        
        let errorMessage = "Could not join the call. Please try again.";
        
        if (error.message?.includes("permission") || error.message?.includes("auth")) {
          errorMessage = "Authentication error. Please login again.";
          navigate('/login');
        } else if (error.message?.includes("not found")) {
          errorMessage = "Call not found. The link may be invalid.";
        }
        
        toast.error(errorMessage);
        setIsConnecting(false);
      }
    };

    if (authUser && tokenData?.token && channelId) {
      initCall();
    }
  }, [tokenData, authUser, channelId, tokenLoading, authLoading, navigate]);

  // Cleanup
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

  // Show loader while initializing
  if (authLoading || tokenLoading || isConnecting) {
    return <PageLoader />;
  }

  // Show error if no auth
  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to join the video call.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center max-w-md p-6">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">Call Failed</h2>
            <p className="text-gray-300 mb-6">
              Could not connect to the call. Please check the link and try again.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/feed')}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
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

const CallContent = () => {
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
      <div className="h-screen">
        <SpeakerLayout />
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;