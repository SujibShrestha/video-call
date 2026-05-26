export interface ClientToServerEvents {
  "join-room": (payload: { roomId: string; userId?: string }) => void;
  offer: (payload: { target: string; sdp: RTCSessionDescriptionInit }) => void;
  answer: (payload: { target: string; sdp: RTCSessionDescriptionInit }) => void;
  "ice-candidate": (payload: { target: string; candidate: RTCIceCandidateInit }) => void;
}

export interface ServerToClientEvents {
  "user-joined": (payload: { socketId: string; userId?: string }) => void;
  "user-left": (payload: { socketId: string; userId?: string }) => void;
  error: (message: string) => void;
  offer: (payload: { from: string; sdp: RTCSessionDescriptionInit }) => void;
  answer: (payload: { from: string; sdp: RTCSessionDescriptionInit }) => void;
  "ice-candidate": (payload: { from: string; candidate: RTCIceCandidateInit }) => void;
  "existing-users": (peers: { socketId: string; userId?: string }[]) => void;
}