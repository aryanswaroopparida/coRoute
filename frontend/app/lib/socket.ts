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
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("send-message", (data: { roomId: string; message: string }) => {
      io.to(data.roomId).emit("receive-message", data);
    });
  });

  return io;
}
