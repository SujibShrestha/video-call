import { Server, Socket } from "socket.io";
import { prisma } from "../config/db.js";

export const registerSignalingHandlers = (io: Server, socket: Socket) => {
  socket.on("join-room", async (payload: { roomId: string; userId?: string }) => {
    const { roomId, userId } = payload || {};
    if (!roomId) {
      socket.emit("error", "Room id not specified");
      return;
    }
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      socket.emit("error", "Room not found");
      return;
    }

    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);

    // Store userId on socket for later mapping
    if (userId) socket.data.userId = userId;

    // Send existing users (socketId + userId) to the joining socket
    const clients = io.sockets.adapter.rooms.get(roomId) || new Set<string>();
    const existing: { socketId: string; userId?: string }[] = [];
    for (const id of clients) {
      if (id === socket.id) continue;
      const s = io.sockets.sockets.get(id);
      existing.push({ socketId: id, userId: s?.data?.userId });
    }
    if (existing.length > 0) {
      socket.emit("existing-users", existing);
    }

    //Notify others with socketId and optional userId
    socket.to(roomId).emit("user-joined", { socketId: socket.id, userId });

    // Relay offer to target peer
    socket.on(
      "offer",
      ({ target, sdp }: { target: string; sdp: RTCSessionDescriptionInit }) => {
        io.to(target).emit("offer", { from: socket.id, sdp });
      },
    );
    //  answer to target peer
    socket.on(
      "answer",
      ({ target, sdp }: { target: string; sdp: RTCSessionDescriptionInit }) => {
        io.to(target).emit("answer", { from: socket.id, sdp });
      },
    );

    // Relay ICE candidate to target peer
    socket.on(
      "ice-candidate",
      ({
        target,
        candidate,
      }: {
        target: string;
        candidate: RTCIceCandidateInit;
      }) => {
        io.to(target).emit("ice-candidate", { from: socket.id, candidate });
      },
    );

    // Notify room on disconnect
    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected from room ${roomId}`);
      socket.to(roomId).emit("user-left", { socketId: socket.id, userId });
    });
  });
};
