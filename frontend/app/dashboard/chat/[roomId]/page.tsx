"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { Send, Hash, UserCircle, MoreHorizontal, Loader2 } from "lucide-react";

let socket: Socket | null = null;

// Defining the shape of our message for better TypeScript support
type Message = {
  roomId: string;
  message: string;
  sender: string;
  timestamp: string;
};

export default function ChatPage() {
  const { roomId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [email, setEmail] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Get User
    fetch("/api/protected/user")
      .then((res) => res.json())
      .then((data) => setEmail(data.user.email));

    // 2. Socket Setup
    socket = io("http://localhost:4000");
    socket.emit("join-room", roomId);

    // --- LOAD OLD MESSAGES ---
    socket.on("load-messages", (history: Message[]) => {
      setMessages(history);
      setIsLoading(false); // Stop loading once history is in
    });

    socket.on("receive-message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user-typing", (userEmail) => {
      if (userEmail !== email) setTypingUser(userEmail.split("@")[0]);
    });

    socket.on("user-stop-typing", () => setTypingUser(null));

    return () => {
      socket?.off("load-messages");
      socket?.off("receive-message");
      socket?.off("user-typing");
      socket?.off("user-stop-typing");
      socket?.disconnect();
    };
  }, [roomId, email]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!socket) return;

    socket.emit("typing", { roomId, email });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop-typing", { roomId });
    }, 2000);
  };

  const sendMessage = () => {
    if (!socket || !message.trim() || !email) return;

    const msg: Message = {
      roomId: roomId as string,
      message,
      sender: email,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send-message", msg);
    socket.emit("stop-typing", { roomId });
    setMessages((prev) => [...prev, msg]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto my-8  rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4  flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Hash size={20} />
          </div>
          <h1 className="font-bold">{roomId}</h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 ">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Fetching chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm italic">
            No previous messages in this room.
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.sender === email;
            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white border text-slate-800 rounded-bl-none"
                    }`}
                  >
                    {m.message}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {isMe ? "Sent" : m.sender.split("@")[0]} • {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {typingUser && (
          <div className="flex items-center gap-2 text-slate-400 italic text-xs animate-pulse">
            <MoreHorizontal size={16} />
            <span>{typingUser} is typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 p-1.5 rounded-xl">
          <input
            className="bg-transparent border-none focus:ring-0 flex-1 p-2 text-sm"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
