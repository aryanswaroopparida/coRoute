import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// --- 1. MongoDB Schema Setup ---
const messageSchema = new mongoose.Schema({
  roomId: String,
  message: String,
  sender: String,
  timestamp: {
    type: String,
    default: () =>
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
  createdAt: { type: Date, default: Date.now },
});

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

// --- 2. Database Connection ---
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB, ", MONGODB_URI))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join-room", async (roomId: string) => {
      socket.join(roomId);

      // --- 3. Load Chat History ---
      // When a user joins, fetch the last 50 messages from the DB
      try {
        const history = await Message.find({ roomId })
          .sort({ createdAt: 1 })
          .limit(50);
        socket.emit("load-messages", history);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    });

    socket.on("send-message", async (data) => {
      // --- 4. Save Message to DB ---
      try {
        const newMessage = new Message({
          roomId: data.roomId,
          message: data.message,
          sender: data.sender,
          timestamp: data.timestamp,
        });
        await newMessage.save();

        // Broadcast to others in the room
        socket.to(data.roomId).emit("receive-message", data);
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    // Typing Indicators
    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("user-typing", data.email);
    });

    socket.on("stop-typing", (data) => {
      socket.to(data.roomId).emit("user-stop-typing");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  httpServer.listen(4000, () => {
    console.log("> Server ready on http://localhost:4000");
  });
});
