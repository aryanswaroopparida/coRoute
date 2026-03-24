"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams } from "next/navigation";
import { Send, Hash, MoreHorizontal, Loader2, Users, X } from "lucide-react";

let socket: Socket | null = null;

type Message = {
  roomId: string;
  message: string;
  sender: string; // email
  timestamp: string;
};

type Participant = {
  email: string;
  name: string;
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

  // ✅ Room info
  const [roomName, setRoomName] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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
  // 🔹 Fetch room info (name + participants)
  // ===============================
  useEffect(() => {
    if (!roomId) return;

    fetch(`/api/protected/room/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        setRoomName(data.name || (roomId as string));
        setParticipants(data.participants || []);
      })
      .catch(() => {
        setRoomName(roomId as string);
      });
  }, [roomId]);

  // ===============================
  // 🔹 Close popover on outside click
  // ===============================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setShowParticipants(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <h1 className="font-bold">{roomName || roomId}</h1>
        </div>

        {/* Participants button */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <Users size={16} />
            <span>{participants.length}</span>
          </button>

          {/* Participants popover */}
          {showParticipants && (
            <div className="absolute right-0 top-10 z-50 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Participants
                </span>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>

              <ul className="py-2 max-h-60 overflow-y-auto">
                {participants.length === 0 ? (
                  <li className="px-4 py-2 text-sm text-slate-400 italic">
                    No participants found
                  </li>
                ) : (
                  participants.map((p) => {
                    const isMe = p.email === email;
                    const initials = p.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <li
                        key={p.email}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {p.name}
                            {isMe && (
                              <span className="ml-1 text-[10px] text-slate-400">
                                (you)
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {p.email}
                          </span>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
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
