import { useEffect, useRef, useState } from "react";
import { P2PCall } from "./service/webrtc"; 

export default function App() {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [roomId, setRoomId] = useState("demo-room-123");
  const [call, setCall] = useState<P2PCall | null>(null);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [sharing, setSharing] = useState(false);

  const signalingURL =  import.meta.env.VITE_SERVER_URL;
  console.log('signal ',signalingURL)
  const join = async () => {

   
    if (!localRef.current || !remoteRef.current) return;
   
    const c = new P2PCall({
      roomId,
      signalingURL,
      localVideo: localRef.current,
      remoteVideo: remoteRef.current,
      onConnected: () => console.log("Connected"),
      onDisconnected: () => console.log("Disconnected"),
    });
    console.log('c',c)
    await c.init();
    setCall(c);
    setJoined(true);
  };

  const startCall = async () => {
    await call?.call();
  };

  const toggleMic = () => {
    const next = !muted;
    call?.toggleMic(next);
    setMuted(next);
  };

  const toggleCam = () => {
    const next = !camOff;
    call?.toggleCamera(next);
    setCamOff(next);
  };

  const toggleShare = async () => {
    const next = !sharing;
    await call?.shareScreen(next);
    setSharing(next);
  };

  const hangup = async () => {
    await call?.hangup();
    setJoined(false);
    setCall(null);
  };

  useEffect(() => {
 
    if (localRef.current) localRef.current.muted = true;
  }, []);

   return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6 flex flex-col items-center">
  
      <h1 className="text-3xl font-semibold mb-6 tracking-tight text-gray-800">
        1:1 Video Call – <span className="text-gray-500">MERN WebRTC</span>
      </h1>

  
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-lg border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
          />
          {!joined ? (
            <button
              onClick={join}
              className="px-5 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all"
            >
              Join
            </button>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 mt-3 sm:mt-0">
              <button
                onClick={startCall}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all"
              >
                Call
              </button>
              <button
                onClick={toggleMic}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
              >
                {muted ? "Unmute" : "Mute"}
              </button>
              <button
                onClick={toggleCam}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
              >
                {camOff ? "Camera On" : "Camera Off"}
              </button>
              <button
                onClick={toggleShare}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all"
              >
                {sharing ? "Stop Share" : "Share Screen"}
              </button>
              <button
                onClick={hangup}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              >
                End
              </button>
            </div>
          )}
        </div>
      </div>

  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
    
        <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200">
          <div className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium">
            Local Stream
          </div>
          <video
            ref={localRef}
            autoPlay
            playsInline
            className="w-full h-[320px] bg-black object-cover rounded-b-2xl"
          />
        </div>

     
        <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200">
          <div className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium">
            Remote Stream
          </div>
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="w-full h-[320px] bg-black object-cover rounded-b-2xl"
          />
        </div>
      </div>


      <p className="mt-6 text-gray-500 text-sm max-w-lg text-center">
        💡 Open this page in two tabs or devices with the same <b>Room ID</b>.
        In one tab, click <b>Join</b> then <b>Call</b> to connect.
      </p>
    </div>
  );
}
