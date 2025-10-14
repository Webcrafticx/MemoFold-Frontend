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
  StreamTheme,
  CallingState,
  useCallStateHooks,
  ParticipantView,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const PageLoader = () => (
  <div className="flex justify-center items-center h-[93vh] md:h-screen bg-gray-900">
    <div className="text-center text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-lg font-medium">Loading call...</p>
    </div>
  </div>
);

const CallPage = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const initializedRef = useRef(false);
  const { user: authUser, token, loading: authLoading } = useAuth();

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken", authUser?._id, channelId],
    queryFn: async () => {
      const authToken = token || localStorage.getItem("token");
      if (!authToken) throw new Error("No auth token found");
      return await apiService.getStreamToken(authToken);
    },
    enabled: !!token && !!channelId,
    retry: 2,
  });

  useEffect(() => {
    if (initializedRef.current) return;

    const initCall = async () => {
      if (authLoading || tokenLoading || !tokenData?.token || !authUser || !channelId) return;

      try {
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
        await new Promise((r) => setTimeout(r, 800));
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
        setIsConnecting(false);
        initializedRef.current = true;
      } catch (err) {
        console.error("❌ Error joining call:", err);
        toast.error("Could not join the call");
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, channelId, tokenLoading, authLoading]);

  useEffect(() => {
    return () => {
      if (call) call.leave().catch(console.error);
      if (client) client.disconnectUser().catch(console.error);
    };
  }, [call, client]);

  if (authLoading || tokenLoading || isConnecting) return <PageLoader />;

  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-[93vh] md:h-screen bg-gray-900">
        <div className="text-center text-white max-w-md p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[93vh] md:h-screen bg-gray-900 fixed inset-0">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <ResponsiveLayout />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center max-w-md p-6">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">Call Failed</h2>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Responsive layout: mobile -> h-[93vh], desktop -> full screen
const ResponsiveLayout = () => {
  const isMobile = window.innerWidth < 768;
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
      <div className="h-[93vh] md:h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="h-[93vh] md:h-screen relative">
        {isMobile ? <MobileFullScreenLayout /> : <SpeakerLayout />}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

// Mobile layout: fullscreen main participant + PiP (tap PiP to swap)
const MobileFullScreenLayout = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [mainSessionId, setMainSessionId] = useState(null);

  useEffect(() => {
    if (!mainSessionId && participants.length > 0) {
      setMainSessionId(participants[0].sessionId);
    }
  }, [participants, mainSessionId]);

  if (!participants || participants.length === 0) {
    return (
      <div className="h-[93vh] md:h-screen flex items-center justify-center text-white">
        Waiting for participants...
      </div>
    );
  }

  const main = participants.find((p) => p.sessionId === mainSessionId) || participants[0];
  const pip = participants.find((p) => p.sessionId !== main.sessionId);

  const handleSwap = () => {
    if (pip) setMainSessionId(pip.sessionId);
  };

  return (
    <div className="relative h-[93vh] md:h-screen w-full bg-black overflow-hidden">
      {/* Fullscreen main */}
      {main && (
        <ParticipantView participant={main} className="w-full h-full object-cover" />
      )}

      {/* PiP (tap to swap) */}
      {pip && (
        <div
          onClick={handleSwap}
          className="absolute bottom-24 right-4 w-28 h-40 bg-gray-800 rounded-xl overflow-hidden border-2 border-white shadow-lg z-20 cursor-pointer"
        >
          <ParticipantView participant={pip} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};

export default CallPage;
