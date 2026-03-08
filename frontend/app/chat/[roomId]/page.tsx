"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "next/navigation";

const socket = io("http://localhost:3000");

export default function ChatPage() {
  const { roomId } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, []);

  const sendMessage = () => {
    socket.emit("send-message", {
      roomId,
      message,
    });

    setMessage("");
  };

  return (
    <div className="p-6">
      <div className="h-[400px] overflow-y-auto border p-4">
        {messages.map((m, i) => (
          <div key={i}>{m.message}</div>
        ))}
      </div>

      <div className="flex mt-4 gap-2">
        <input
          className="border p-2 flex-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="bg-blue-500 text-white px-4" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
