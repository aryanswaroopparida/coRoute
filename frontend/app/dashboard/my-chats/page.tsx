"use client";

import { useEffect, useState } from "react";
import { Container } from "@/app/components/Container";
import { Heading } from "@/app/components/Heading";
import { tsToIST12hr } from "@/app/utils/date";

type Room = {
  _id: string;
  type: "group" | "personal";
  slot: number;
  participants: string[];
  createdAt: string;
};

export default function ChatsPage() {
  const [groupChats, setGroupChats] = useState<Room[]>([]);
  const [personalChats, setPersonalChats] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      const res = await fetch("/api/protected/chat/my-rooms");
      const data = await res.json();

      const groups: Room[] = [];
      const personals: Room[] = [];

      for (const room of data.rooms) {
        if (room.type === "group") groups.push(room);
        else personals.push(room);
      }

      setGroupChats(groups);
      setPersonalChats(personals);
      setLoading(false);
    };

    loadRooms();
  }, []);

  if (loading) return <p>Loading chats...</p>;

  return (
    <Container>
      <Heading className="font-black">Your Chats</Heading>

      {/* GROUP CHATS */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Group Chats</h2>

        {groupChats.length === 0 && (
          <p className="text-gray-500">No group chats yet</p>
        )}

        <div className="grid gap-4">
          {groupChats.map((room) =>
            room.participants.length > 1 ? (
              <div
                key={room._id}
                className="border p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{tsToIST12hr(room.slot)}</p>
                  <p className="text-sm text-gray-500">
                    Participants: {room.participants.length}
                  </p>
                </div>

                <button
                  onClick={() =>
                    (window.location.href = `/dashboard/chat/${room._id}`)
                  }
                  className="text-blue-600 text-sm"
                >
                  Open
                </button>
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* PERSONAL CHATS */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Personal Chats</h2>

        {personalChats.length === 0 && (
          <p className="text-gray-500">No personal chats yet</p>
        )}

        <div className="grid gap-4">
          {personalChats.map((room) => (
            <div
              key={room._id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{room.participants.join(", ")}</p>
                <p className="text-sm text-gray-500">{}</p>
              </div>

              <button
                onClick={() =>
                  (window.location.href = `/dashboard/chat/${room._id}`)
                }
                className="text-blue-600 text-sm"
              >
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
