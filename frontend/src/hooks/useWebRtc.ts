import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { ICE_CONFIG } from "../lib/webrtc";

interface WebRTCCallbacks {
  // socketId: the socket.io id, userId: optional application user id (if available)
  onUserJoined?: (socketId: string, userId?: string) => void
  onUserLeft?: (socketId: string, userId?: string) => void
  onError?: (message: string) => void
}

export const useWebRTC = (roomId: string | null, callbacks: WebRTCCallbacks = {}, userId?: string) => {
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );

  const getLocalStream = async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };

  const createPeerConnection = (socketId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_CONFIG);

    // Add local tracks to the connection
    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    // Send ICE candidates to the remote peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          target: socketId,
          candidate: event.candidate,
        });
      }
    };

    // Receive remote stream
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStreams((prev) => new Map(prev).set(socketId, stream));
    };

    peersRef.current.set(socketId, pc);
    return pc;
  };
  const handleUserJoined = async (socketId: string) => {
    const pc = createPeerConnection(socketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { target: socketId, sdp: offer });
  };

  const handleOffer = async ({
    from,
    sdp,
  }: {
    from: string;
    sdp: RTCSessionDescriptionInit;
  }) => {
    const pc = createPeerConnection(from);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { target: from, sdp: answer });
  };

  const handleAnswer = async ({
    from,
    sdp,
  }: {
    from: string;
    sdp: RTCSessionDescriptionInit;
  }) => {
    const pc = peersRef.current.get(from);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const handleIceCandidate = async ({
    from,
    candidate,
  }: {
    from: string;
    candidate: RTCIceCandidateInit;
  }) => {
    const pc = peersRef.current.get(from);
    if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleUserLeft = (socketId: string) => {
    peersRef.current.get(socketId)?.close();
    peersRef.current.delete(socketId);
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(socketId);
      return next;
    });
  };

  const toggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
  };
 useEffect(() => {
  if (!roomId) return;

  const init = async () => {
    await getLocalStream();

    socket.connect();

    // Register handlers before joining so we don't miss incoming offers
    socket.on("user-joined", (payload: { socketId: string; userId?: string }) => {
      callbacks.onUserJoined?.(payload.socketId, payload.userId);
      handleUserJoined(payload.socketId);
    });
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("existing-users", (peers: { socketId: string; userId?: string }[]) => {
      // Pre-create peer connections for existing users so incoming offers can be handled
      peers.forEach((p) => {
        // register mapping via callback and create PC (but don't create an offer)
        callbacks.onUserJoined?.(p.socketId, p.userId);
        createPeerConnection(p.socketId);
      });
    });
    socket.on("user-left", (payload: { socketId: string; userId?: string }) => {
      callbacks.onUserLeft?.(payload.socketId, payload.userId);
      handleUserLeft(payload.socketId);
    });
    socket.on("error", (msg) => {
      callbacks.onError?.(msg);
    });

    // Now join the room (after handlers are in place)
    socket.emit("join-room", { roomId, userId });
  };

  init();

  return () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();

    socket.off("user-joined");
    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");
    socket.off("existing-users");
    socket.off("user-left");
    socket.off("error");

    socket.disconnect();
  };
}, [roomId]);

    

  return { localStream, remoteStreams, toggleAudio, toggleVideo };
};
