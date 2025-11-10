import io, { Socket } from "socket.io-client";

export interface RTCDeps {
  roomId: string;
  signalingURL: string;
  localVideo: HTMLVideoElement;
  remoteVideo: HTMLVideoElement;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class P2PCall {
  private socket!: Socket;
  private pc!: RTCPeerConnection;
  private localStream!: MediaStream;
  private deps: RTCDeps;

  constructor(deps: RTCDeps) {
    this.deps = deps;
  }

  async init() {
    // 1️⃣ Connect to signaling server
    this.socket = io(this.deps.signalingURL, { transports: ["websocket"] });
    await new Promise<void>((resolve) => {
      this.socket.on("connect", () => {
        console.log("Connected to signaling server");
        resolve();
      });
    });

    // 2️⃣ Create PeerConnection
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    
    // 3️⃣ Remote track → attach to remote <video>
    const remoteStream = new MediaStream();
    this.deps.remoteVideo.srcObject = remoteStream;
    this.pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
    };

    // 4️⃣ Local media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (err) {
      console.error("User denied camera/mic permission:", err);
      alert("Please allow camera and microphone access to join the call.");
      throw err;
    }

    this.deps.localVideo.srcObject = this.localStream;
    this.localStream.getTracks().forEach((t) => this.pc.addTrack(t, this.localStream));

    // 5️⃣ ICE candidates
    this.pc.onicecandidate = (e) => {
      if (e.candidate) {

        console.log('e . candidate :',e.candidate)
        this.socket.emit("ice-candidate", {
          roomId: this.deps.roomId,
          candidate: e.candidate,
          from: this.socket.id,
        });
      }
    };

    // 6️⃣ Connection state
    this.pc.onconnectionstatechange = () => {
      const s = this.pc.connectionState;
      if (s === "connected") this.deps.onConnected?.();
      if (["disconnected", "failed", "closed"].includes(s)) this.deps.onDisconnected?.();
    };

    // 7️⃣ Signaling listeners
    this.socket.on("offer", async ({ sdp }) => {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.socket.emit("answer", {
        roomId: this.deps.roomId,
        sdp: answer,
        from: this.socket.id,
      });
    });

    this.socket.on("answer", async ({ sdp }) => {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    this.socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await this.pc.addIceCandidate(candidate);
      } catch (err) {
        console.error("Failed to add ICE", err);
      }
    });

    this.socket.on("reconnect", () => {
      this.socket.emit("join", this.deps.roomId);
    });

    // 8️⃣ Join the room
    this.socket.emit("join", this.deps.roomId);
  }

  async call() {
    if (this.pc.signalingState !== "stable") {
      console.warn("Cannot create offer, state:", this.pc.signalingState);
      return;
    }
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.socket.emit("offer", {
      roomId: this.deps.roomId,
      sdp: offer,
      from: this.socket.id,
    });
  }

  toggleMic(mute: boolean) {
    this.localStream.getAudioTracks().forEach((t) => (t.enabled = !mute));
  }

  toggleCamera(off: boolean) {
    this.localStream.getVideoTracks().forEach((t) => (t.enabled = !off));
  }

  async shareScreen(on: boolean) {
    if (on) {
      const screen = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const screenTrack = screen.getVideoTracks()[0];
      const sender = this.pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && screenTrack) {
        await sender.replaceTrack(screenTrack);
        screenTrack.onended = () => this.shareScreen(false);
      }
    } else {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      const camTrack = cam.getVideoTracks()[0];
      const sender = this.pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && camTrack) await sender.replaceTrack(camTrack);
    }
  }

  async hangup() {
    this.pc.getSenders().forEach((s) => s.track && s.track.stop());
    this.localStream.getTracks().forEach((t) => t.stop());
    this.pc.close();
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }
}
