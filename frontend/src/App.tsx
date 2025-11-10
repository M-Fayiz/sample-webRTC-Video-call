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

  const signalingURL = "http://localhost:4000";

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
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h1>1:1 WebRTC (MERN) – Minimal Demo</h1>

      <div style={{ marginBottom: 12 }}>
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room ID"
          style={{ padding: 8, width: 240 }}
        />
        {!joined ? (
          <button onClick={join} style={{ marginLeft: 8, padding: "8px 12px" }}>Join</button>
        ) : (
          <>
            <button onClick={startCall} style={{ marginLeft: 8, padding: "8px 12px" }}>Call</button>
            <button onClick={toggleMic} style={{ marginLeft: 8, padding: "8px 12px" }}>
              {muted ? "Unmute" : "Mute"}
            </button>
            <button onClick={toggleCam} style={{ marginLeft: 8, padding: "8px 12px" }}>
              {camOff ? "Camera On" : "Camera Off"}
            </button>
            <button onClick={toggleShare} style={{ marginLeft: 8, padding: "8px 12px" }}>
              {sharing ? "Stop Share" : "Share Screen"}
            </button>
            <button onClick={hangup} style={{ marginLeft: 8, padding: "8px 12px", color: "white", background: "crimson" }}>
              End
            </button>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <h3>Local</h3>
          <video ref={localRef} autoPlay playsInline style={{ width: "100%", background: "#000" }} />
        </div>
        <div>
          <h3>Remote</h3>
          <video ref={remoteRef} autoPlay playsInline style={{ width: "100%", background: "#000" }} />
        </div>
      </div>

      <p style={{ marginTop: 12, opacity: 0.8 }}>
        Open this page in two tabs/devices with the same Room ID. In one tab, press <b>Join</b> then <b>Call</b>.
      </p>
    </div>
  );
}
