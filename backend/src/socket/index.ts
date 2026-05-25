import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { registerSignalingHandlers } from "./signaling.js";

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST", "DELETE"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    registerSignalingHandlers(io, socket);
  });
};