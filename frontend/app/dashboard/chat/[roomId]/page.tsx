"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { Send, Hash, MoreHorizontal, Loader2 } from "lucide-react";

let socket: Socket | null = null;

type Message = {
  roomId: string;
  message: string;
  sender: string; // email
  timestamp: string;
};

export default function ChatPage() {
  const { roomId } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [email, setEmail] = useState("");

  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 Email → Name cache
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ Ref so socket listeners always read the latest email value
  const emailRef = useRef<string>("");

  // ===============================
  // 🔹 Resolve name from API (cached)
  // ===============================
  const resolveName = async (email: string) => {
    if (!email) return "Unknown";

    // already cached
    if (userMap[email]) return userMap[email];

    try {
      const res = await fetch("/api/protected/user", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      const name = data.name || email.split("@")[0];

      setUserMap((prev) => ({
        ...prev,
        [email]: name,
      }));

      return name;
    } catch {
      return email.split("@")[0];
    }
  };

  // ===============================
  // 🔹 Initial Setup
  // ===============================
  useEffect(() => {
    // Get logged-in user
    fetch("/api/protected/user")
      .then((res) => res.json())
      .then((data) => {
        setEmail(data.user.email);
        emailRef.current = data.user.email; // ✅ keep ref in sync
      });

    socket = io("http://localhost:4000");
    socket.emit("join-room", roomId);

    // Load messages
    socket.on("load-messages", (history: Message[]) => {
      setMessages(history);
      setIsLoading(false);
    });

    socket.on("receive-message", (msg: Message) => {
      // ✅ Use ref (not state) so this always has the current email
      if (msg.sender !== emailRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // 🔥 Typing with name resolution
    socket.on("user-typing", async (userEmail) => {
      if (userEmail !== emailRef.current) {
        const name = await resolveName(userEmail);
        setTypingUser(name);
      }
    });

    socket.on("user-stop-typing", () => setTypingUser(null));

    return () => {
      socket?.disconnect();
    };
  }, [roomId]);

  // ===============================
  // 🔹 Resolve names for messages
  // ===============================
  useEffect(() => {
    const fetchNames = async () => {
      const uniqueEmails = [...new Set(messages.map((m) => m.sender))];
      await Promise.all(uniqueEmails.map(resolveName));
    };

    if (messages.length) fetchNames();
  }, [messages]);

  // ===============================
  // 🔹 Auto Scroll
  // ===============================
  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // ===============================
  // 🔹 Typing Handler
  // ===============================
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!socket) return;

    socket.emit("typing", { roomId, email });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop-typing", { roomId });
    }, 2000);
  };

  // ===============================
  // 🔹 Send Message
  // ===============================
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

  // ===============================
  // 🔹 Render
  // ===============================
  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto my-8 rounded-2xl shadow-xl overflow-hidden dark:bg-white/5">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Hash size={20} />
          </div>
          <h1 className="font-bold">{roomId}</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm">Fetching chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm italic">
            No previous messages.
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.sender === email;
            const senderName = userMap[m.sender] || m.sender.split("@")[0];

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col max-w-[75%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
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
                    {isMe ? "Sent" : senderName} • {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing */}
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
            className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
