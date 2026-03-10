import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: IOServer;

export function initSocket(server: HTTPServer): IOServer {
  if (io) return io;

  io = new IOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join chat room
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
    });

    // Send message to room
    socket.on("send-message", (data) => {
      io.to(data.roomId).emit("receive-message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}
