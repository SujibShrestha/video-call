import { Server, Socket } from "socket.io";
import { prisma } from "../config/db.js";

export const registerSignalingHandlers = (io: Server, socket: Socket) => {
  socket.on("join-room", async (roomId: string) => {
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

    //Notify others
    socket.to(roomId).emit("user-joined", socket.id);

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
      socket.to(roomId).emit("user-left", socket.id);
    });
  });
};
