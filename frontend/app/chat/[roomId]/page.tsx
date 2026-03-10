"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";

let socket: Socket | null = null;

type Message = {
  roomId: string;
  message: string;
  sender: string;
};

export default function ChatPage() {
  const { roomId } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [email, setEmail] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch logged-in user (comes from middleware header)
  useEffect(() => {
    async function getUser() {
      const res = await fetch("/api/protected/user");
      const data = await res.json();
      setEmail(data.user.email);
    }

    getUser();
  }, []);

  // Socket connection
  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.emit("join-room", roomId);

    socket.off("receive-message");

    socket.on("receive-message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket?.disconnect();
    };
  }, [roomId]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !message.trim() || !email) return;

    const msg: Message = {
      roomId: roomId as string,
      message,
      sender: email,
    };

    socket.emit("send-message", msg);

    // show immediately for sender
    setMessages((prev) => [...prev, msg]);

    setMessage("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Chat</h1>

      {/* Chat box */}
      <div className="h-[450px] overflow-y-auto border rounded-lg p-4 bg-gray-50">
        {messages.map((m, i) => {
          const isMe = m.sender === email;

          return (
            <div
              key={i}
              className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[65%] shadow-sm ${
                  isMe ? "bg-blue-500 text-white" : "bg-white border text-black"
                }`}
              >
                {!isMe && (
                  <div className="text-xs text-gray-500 mb-1">{m.sender}</div>
                )}
                {m.message}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="flex mt-4 gap-2">
        <input
          className="border rounded-lg p-3 flex-1"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-6 rounded-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
