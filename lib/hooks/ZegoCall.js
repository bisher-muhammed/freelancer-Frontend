"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { apiPrivate } from "../apiPrivate";

export default function ZegoCall({ chatRoomId, callType, onEndCall, userRole, userId }) {
  const zgRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  
  const isInitializing = useRef(false); 
  const isLoggedId = useRef(false);

  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isBlurOn, setIsBlurOn] = useState(false);
  const [connectionState, setConnectionState] = useState("DISCONNECTED");

  const leaveCall = useCallback(async () => {
    if (!zgRef.current) return;
    try {
      if (localStreamRef.current) {
        zgRef.current.stopPublishingStream(`stream_${userId}_main`);
        zgRef.current.destroyStream(localStreamRef.current);
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        zgRef.current.stopPublishingStream(`stream_${userId}_screen`);
        zgRef.current.destroyStream(screenStreamRef.current);
        screenStreamRef.current = null;
      }
      if (isLoggedId.current) {
        await zgRef.current.logoutRoom(String(chatRoomId));
        isLoggedId.current = false;
      }
    } catch (e) {
      console.warn("Cleanup error:", e);
    }
  }, [userId, chatRoomId]);

  const startCall = useCallback(async () => {
    if (isInitializing.current || isLoggedId.current) return;
    isInitializing.current = true;

    try {
      const res = await apiPrivate.post("video/zego-token/", { chat_room_id: chatRoomId });
      const { app_id, zego_token: token, room_id, user_id, server } = res.data;

      if (!zgRef.current) {
        zgRef.current = new ZegoExpressEngine(parseInt(app_id), server);
      }
      const zg = zgRef.current;

      zg.on("roomStateUpdate", (roomID, state) => setConnectionState(state));
      
      zg.on("roomStreamUpdate", async (roomID, updateType, streamList) => {
        if (updateType === "ADD") {
          for (const info of streamList) {
            const stream = await zg.startPlayingStream(info.streamID);
            setRemoteStreams(prev => [...prev.filter(s => s.streamID !== info.streamID), { 
              streamID: info.streamID, 
              user: info.user, 
              stream 
            }]);
          }
        } else if (updateType === "DELETE") {
          for (const info of streamList) {
            zg.stopPlayingStream(info.streamID);
            setRemoteStreams(prev => prev.filter(s => s.streamID !== info.streamID));
          }
        }
      });

      await zg.loginRoom(String(room_id), token, { userID: String(user_id), userName: String(user_id) });
      isLoggedId.current = true;

      // IMPROVED: High Quality Video + Beauty Effects
      const localStream = await zg.createStream({
        camera: { 
          audio: true, 
          video: callType === "video" ? {
            quality: 4, // 1080p
            width: 1920,
            height: 1080,
            frameRate: 30,
            bitrate: 3000
          } : false 
        }
      });
      localStreamRef.current = localStream;
      
      // Apply Face Beautification
      await zg.setEffectsBeauty(localStream, true, {
        sharpenIntensity: 50,
        whitenIntensity: 50,
        rosyIntensity: 50,
        smoothIntensity: 50
      });

      const localVideo = document.getElementById("local-video-el");
      if (localVideo) localVideo.srcObject = localStream;

      await zg.startPublishingStream(`stream_${user_id}_main`, localStream);

    } catch (err) {
      console.error("Call Init Error:", err);
      if (err.code !== 1002056) onEndCall?.();
    } finally {
      isInitializing.current = false;
    }
  }, [chatRoomId, callType, onEndCall]);

  // IMPROVED: High Resolution Screen Sharing logic
  const toggleScreenShare = async () => {
    if (!isSharingScreen) {
      try {
        const screenStream = await zgRef.current.createStream({ 
          screen: {
            video: {
              quality: 4,
              width: window.screen.width,
              height: window.screen.height,
              frameRate: 15, // Better for text clarity
              bitrate: 4000
            }
          } 
        });
        screenStreamRef.current = screenStream;
        
        // PUBLISHING AS A SEPARATE STREAM - This makes it visible to others
        await zgRef.current.startPublishingStream(`stream_${userId}_screen`, screenStream);
        
        screenStream.getTracks().forEach(track => {
          track.onended = () => stopScreenShare();
        });

        setIsSharingScreen(true);
      } catch (err) {
        console.error("Screen share failed", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      zgRef.current.stopPublishingStream(`stream_${userId}_screen`);
      zgRef.current.destroyStream(screenStreamRef.current);
      screenStreamRef.current = null;
    }
    setIsSharingScreen(false);
  };

  // FEATURE: Background Blur
  const toggleBlur = async () => {
    if (!localStreamRef.current) return;
    const newState = !isBlurOn;
    try {
      if (newState) {
        await zgRef.current.setVirtualBackgroundOptions(localStreamRef.current, {
          source: 'blur', 
          blurDegree: 3 
        });
      } else {
        await zgRef.current.setVirtualBackgroundOptions(localStreamRef.current, { source: 'none' });
      }
      setIsBlurOn(newState);
    } catch (e) {
      console.error("Blur toggle failed", e);
    }
  };

  useEffect(() => {
    startCall();
    return () => { leaveCall(); };
  }, [startCall, leaveCall]);

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 md:left-64 bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white flex flex-col z-40">
      {/* Header */}
      <div className="h-16 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-sm">Live Call</span>
          <span className="text-xs text-gray-400 ml-2">
            {connectionState === "CONNECTED" ? "Connected" : "Connecting..."}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {remoteStreams.length} {remoteStreams.length === 1 ? "participant" : "participants"}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="h-full grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {/* Local Feed */}
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 min-h-[300px]">
            <video id="local-video-el" autoPlay muted playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="bg-gray-900/90 backdrop-blur-xl px-3 py-1.5 rounded-full text-xs font-medium border border-gray-700/50 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                You {isBlurOn && "• Blurred"}
              </div>
            </div>
            {isMicMuted && (
              <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-xl p-2 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Remote Feeds */}
          {remoteStreams.map((item) => (
            <div key={item.streamID} className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 min-h-[300px]">
              <video 
                autoPlay 
                playsInline 
                ref={el => el && (el.srcObject = item.stream)} 
                className={`w-full h-full ${item.streamID.includes('screen') ? 'object-contain bg-black' : 'object-cover'}`} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className={`${item.streamID.includes('screen') ? 'bg-blue-600/90' : 'bg-gray-900/90'} backdrop-blur-xl px-3 py-1.5 rounded-full text-xs font-medium border ${item.streamID.includes('screen') ? 'border-blue-500/50' : 'border-gray-700/50'} flex items-center gap-2`}>
                  {item.streamID.includes('screen') ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                      </svg>
                      Screen: {item.user.userID}
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      User {item.user.userID}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Control Bar */}
      <div className="h-24 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 flex items-center justify-center gap-3 px-6">
        <button 
          onClick={toggleBlur} 
          className={`group relative px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isBlurOn ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30' : 'bg-gray-800 hover:bg-gray-750 border border-gray-700'}`}
          title={isBlurOn ? "Turn off background blur" : "Blur background"}>
          <span className="flex items-center gap-2">
            ✨ {isBlurOn ? "Blur Off" : "Blur Background"}
          </span>
        </button>

        <button 
          onClick={() => {
            const mute = !isMicMuted;
            zgRef.current.mutePublishStreamAudio(localStreamRef.current, mute);
            setIsMicMuted(mute);
          }} 
          className={`group relative px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isMicMuted ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30' : 'bg-gray-800 hover:bg-gray-750 border border-gray-700'}`}
          title={isMicMuted ? "Unmute microphone" : "Mute microphone"}>
          <span className="flex items-center gap-2">
            {isMicMuted ? "🔇" : "🎤"} {isMicMuted ? "Unmute" : "Mute"}
          </span>
        </button>

        <button 
          onClick={toggleScreenShare} 
          className={`group relative px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${isSharingScreen ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-gray-800 hover:bg-gray-750 border border-gray-700'}`}
          title={isSharingScreen ? "Stop screen sharing" : "Share your screen"}>
          <span className="flex items-center gap-2">
            🖥️ {isSharingScreen ? "Stop Share" : "Share Screen"}
          </span>
        </button>

        <button 
          onClick={() => { leaveCall(); onEndCall?.(); }} 
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 ml-2"
          title="End call">
          End Call
        </button>
      </div>
    </div>
  );
}