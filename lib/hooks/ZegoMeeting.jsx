"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { apiPrivate } from "../apiPrivate";

export default function ZegoMeeting({ meetingId, onMeetingEnd, userId }) {
  const zgRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  
  const isInitializing = useRef(false); 
  const isLoggedId = useRef(false);
  const tokenRequestedRef = useRef(false);
  const destroyedRef = useRef(false);



  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isBlurOn, setIsBlurOn] = useState(false);
  const [connectionState, setConnectionState] = useState("DISCONNECTED");

  const leaveMeeting = useCallback(async () => {
    if (!zgRef.current) return;
    try {
      if (localStreamRef.current) {
        zgRef.current.stopPublishingStream(`meeting_stream_${userId}_main`);
        zgRef.current.destroyStream(localStreamRef.current);
        localStreamRef.current = null;
      }
      if (isLoggedId.current) {
        await zgRef.current.logoutRoom(String(meetingId));
        isLoggedId.current = false;
      }
    } catch (e) {
      console.warn("Cleanup error:", e);
    }
  }, [userId, meetingId]);

  const startMeeting = useCallback(async () => {
  if (
    tokenRequestedRef.current || 
    isInitializing.current || 
    isLoggedId.current
  ) {
    return;
  }

  tokenRequestedRef.current = true;
  isInitializing.current = true;

  try {
    const res = await apiPrivate.post("/meeting/zego-token/", {
      meeting_id: meetingId,
    });

    const { app_id, zego_token, room_id, user_id, server } = res.data;

    if (!zgRef.current) {
      zgRef.current = new ZegoExpressEngine(Number(app_id), server);
    }

    const zg = zgRef.current;

    zg.on("roomStateUpdate", (_, state) => {
      setConnectionState(state);
    });

    zg.on("roomStreamUpdate", async (_, type, list) => {
      if (type === "ADD") {
        for (const info of list) {
          const stream = await zg.startPlayingStream(info.streamID);
          setRemoteStreams(prev => [
            ...prev.filter(s => s.streamID !== info.streamID),
            { streamID: info.streamID, user: info.user, stream }
          ]);
        }
      }

      if (type === "DELETE") {
        for (const info of list) {
          zg.stopPlayingStream(info.streamID);
          setRemoteStreams(prev =>
            prev.filter(s => s.streamID !== info.streamID)
          );
        }
      }
    });

    await zg.loginRoom(room_id, zego_token, {
      userID: user_id,
      userName: user_id,
    });

    isLoggedId.current = true;

    const localStream = await zg.createStream({
      camera: {
        audio: true,
        video: true,
        videoQuality: 4,

        width: 1280,
        height: 720,
        frameRate: 30,
        bitrate: 1500,
      },
    });


    localStreamRef.current = localStream;

    const videoEl = document.getElementById("meeting-local-video");
    if (videoEl) {
      videoEl.srcObject = localStream;
      await videoEl.play().catch(() => {});
    }

    await zg.startPublishingStream(
      `meeting_stream_${userId}_main`,
      localStream
    );

  } catch (err) {
    console.error("Meeting init failed:", err);
  } finally {
    isInitializing.current = false;
  }
}, [meetingId, userId]);


  const toggleMic = () => {
    const mute = !isMicMuted;
    zgRef.current.mutePublishStreamAudio(localStreamRef.current, mute);
    setIsMicMuted(mute);
  };

  const toggleCamera = () => {
    const off = !isCamOff;
    zgRef.current.mutePublishStreamVideo(localStreamRef.current, off);
    setIsCamOff(off);
  };

  const toggleScreenShare = async () => {
    if (!isSharingScreen) {
      try {
        const screenStream = await zgRef.current.createStream({ 
          screen: { video: { quality: 4, frameRate: 15 } } 
        });
        screenStreamRef.current = screenStream;
        await zgRef.current.startPublishingStream(`meeting_stream_${userId}_screen`, screenStream);
        setIsSharingScreen(true);
        screenStream.getTracks().forEach(t => t.onended = () => stopScreenShare());
      } catch (err) { console.error(err); }
    } else { stopScreenShare(); }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      zgRef.current.stopPublishingStream(`meeting_stream_${userId}_screen`);
      zgRef.current.destroyStream(screenStreamRef.current);
      screenStreamRef.current = null;
    }
    setIsSharingScreen(false);
  };

  useEffect(() => {
  // Initiate meeting once
  startMeeting();

  return () => {
    // Mark destroyed to avoid state updates after unmount
    destroyedRef.current = true;
  };
  // IMPORTANT: empty deps array → runs only once
}, []);


  return (
    <div className="fixed inset-0 md:left-64 bg-slate-950 text-white flex flex-col z-40 overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${connectionState === "CONNECTED" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
          <span className="font-bold">Meeting Room</span>
        </div>
        <div className="text-sm text-gray-400">ID: {meetingId}</div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr overflow-y-auto">
        {/* Local Video Container */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
          <video 
            id="meeting-local-video" 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover ${isCamOff ? 'opacity-0' : 'opacity-100'}`} 
          />
          {isCamOff && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-gray-500 text-lg font-medium">Camera is Off</div>
             </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs">
            You (Local)
          </div>
        </div>

        {/* Remote Videos */}
        {remoteStreams.map((item) => (
          <div key={item.streamID} className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
            <video 
              autoPlay 
              playsInline 
              ref={el => el && (el.srcObject = item.stream)} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs">
              User: {item.user.userID}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 px-6 shrink-0 pb-20">
        <button 
          onClick={toggleMic} 
          className={`p-4 rounded-xl transition-colors ${isMicMuted ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
          {isMicMuted ? "🔇 Unmute" : "🎤 Mute"}
        </button>
        
        <button 
          onClick={toggleCamera} 
          className={`p-4 rounded-xl transition-colors ${isCamOff ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
          {isCamOff ? "📹 Cam On" : "📹 Cam Off"}
        </button>

        <button 
          onClick={toggleScreenShare} 
          className={`p-4 rounded-xl ${isSharingScreen ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
          🖥️ Share Screen
        </button>

        <button
        onClick={async () => {
          await leaveMeeting();
          onMeetingEnd?.();
        }}
        className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold ml-4"
      >
        End Meeting
      </button>

      </div>
    </div>
  );
}