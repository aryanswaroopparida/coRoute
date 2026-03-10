"use client";

import { Container } from "@/app/components/Container";
import { Heading } from "@/app/components/Heading";
import { Paragraph } from "@/app/components/Paragraph";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { useRef, useState, useEffect } from "react";

const libraries: "places"[] = ["places"];
const SLOT_SIZE = 600; // 10 minutes

type Student = {
  email: string;
  name: string;
  destination: string;
  distance: number;
};

export default function DashboardPage() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [email, setEmail] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [matchNow, setMatchNow] = useState(false);
  const [radius, setRadius] = useState(1);

  const [genderFilter, setGenderFilter] = useState<"any" | "girls" | "boys">(
    "any",
  );

  const [timeRange, setTimeRange] = useState<"10" | "30" | "60">("10");

  const [mapCenter, setMapCenter] = useState({
    lat: 17.9689,
    lng: 79.5941,
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/protected/user");
      const jsonData = await res.json();
      setEmail(jsonData.user.email);
    })();
  }, []);

  const normalizeSlot = (unixSeconds: number) =>
    Math.floor(unixSeconds / SLOT_SIZE) * SLOT_SIZE;

  const getNextSlotUnix = () => {
    const now = Math.floor(Date.now() / 1000);
    return Math.ceil(now / SLOT_SIZE) * SLOT_SIZE;
  };

  const handleFindMatches = async () => {
    if (!selectedLocation) {
      alert("Please select a destination.");
      return;
    }

    let slotUnix: number;

    if (matchNow) {
      slotUnix = getNextSlotUnix();
    } else {
      if (!selectedDate || !selectedTime) {
        alert("Please select date and time.");
        return;
      }

      const combined = new Date(`${selectedDate}T${selectedTime}`);
      const unixSeconds = Math.floor(combined.getTime() / 1000);
      slotUnix = normalizeSlot(unixSeconds);

      const now = Math.floor(Date.now() / 1000);
      if (slotUnix < now) {
        alert("Cannot book past time.");
        return;
      }
    }

    let futureSlots = 0;
    if (timeRange === "30") futureSlots = 3;
    if (timeRange === "60") futureSlots = 6;

    try {
      setLoading(true);

      const { lat, lng } = selectedLocation;

      await fetch("/api/protected/geo/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: email.toLowerCase(),
          latitude: lat,
          longitude: lng,
          slot: slotUnix,
        }),
      });

      const res = await fetch(
        `/api/protected/geo/nearby?lat=${lat}&lng=${lng}&radius=${radius}&slot=${slotUnix}&genderFilter=${genderFilter}&futureSlots=${futureSlots}`,
      );

      const data = await res.json();

      const filtered =
        data.users?.filter(
          (user: any) => user.email.toLowerCase() !== email.toLowerCase(),
        ) || [];

      const formatted: Student[] = filtered.map((user: any) => ({
        email: user.email,
        name: user.name,
        destination: "Selected Destination",
        distance: 0,
      }));

      setStudents(formatted);

      const participants = [
        email.toLowerCase(),
        ...formatted.map((u) => u.email.toLowerCase()),
      ];

      const roomRes = await fetch("/api/protected/chat/create-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slot: data.matchedSlot || slotUnix,
          participants,
        }),
      });

      const roomData = await roomRes.json();

      const roomId = roomData.room._id;

      console.log("Group Room:", roomId);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <p>Loading Maps...</p>;

  return (
    <Container>
      <Heading className="font-black">Destination Match</Heading>

      <Paragraph className="mt-4 max-w-xl">
        Book a slot or match instantly.
      </Paragraph>

      <div className="mt-6 flex items-center gap-2">
        <input
          type="checkbox"
          checked={matchNow}
          onChange={(e) => setMatchNow(e.target.checked)}
        />
        <label className="font-semibold">Match Now (Next 10 min)</label>
      </div>

      <div className="mt-4">
        <label className="block mb-2 font-semibold">Select Date</label>
        <input
          type="date"
          disabled={matchNow}
          className="w-full p-3 border rounded-lg disabled:opacity-50"
          value={selectedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="block mb-2 font-semibold">Select Time</label>
        <input
          type="time"
          disabled={matchNow}
          step="600"
          className="w-full p-3 border rounded-lg disabled:opacity-50"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="block mb-2 font-semibold">Radius (km)</label>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full p-3 border rounded-lg"
        >
          <option value={1}>1 km</option>
          <option value={2}>2 km</option>
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="block mb-2 font-semibold">Search Time Range</label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as "10" | "30" | "60")}
          className="w-full p-3 border rounded-lg"
        >
          <option value="10">Next 10 Minutes</option>
          <option value="30">Next 30 Minutes</option>
          <option value="60">Next 1 Hour</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="block mb-2 font-semibold">Gender Preference</label>
        <select
          className="w-full p-3 border rounded-lg"
          value={genderFilter}
          onChange={(e) =>
            setGenderFilter(e.target.value as "any" | "girls" | "boys")
          }
        >
          <option value="any">Anyone</option>
          <option value="girls">Only Girls</option>
          <option value="boys">Only Boys</option>
        </select>
      </div>

      <div className="mt-6">
        <Autocomplete
          onLoad={(auto) => {
            autocompleteRef.current = auto;

            const bounds = new window.google.maps.LatLngBounds(
              { lat: 15.8, lng: 77.1 },
              { lat: 19.9, lng: 81.1 },
            );

            auto.setBounds(bounds);
          }}
          onPlaceChanged={() => {
            if (!autocompleteRef.current) return;
            const place = autocompleteRef.current.getPlace();
            if (!place.geometry?.location) return;

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setSelectedLocation({ lat, lng });
            setMapCenter({ lat, lng });
          }}
          options={{
            componentRestrictions: { country: "in" },
          }}
        >
          <input
            type="text"
            placeholder="Search destination"
            className="w-full p-3 border rounded-lg"
          />
        </Autocomplete>
      </div>

      <div className="mt-6 h-[400px] w-full rounded-xl overflow-hidden border">
        <GoogleMap
          center={mapCenter}
          zoom={14}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </div>

      <button
        onClick={handleFindMatches}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Find Matches
      </button>

      {loading && <p className="mt-6 text-gray-500">Finding students...</p>}

      {!loading && students.length > 0 && (
        <div className="grid gap-4 mt-8">
          {students.map((student) => (
            <div key={student.email} className="flex flex-row justify-between">
              <span>{student.name}</span>

              <button
                onClick={async () => {
                  const res = await fetch(
                    "/api/protected/chat/create-personal",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        userA: email,
                        userB: student.email,
                      }),
                    },
                  );

                  const data = await res.json();

                  window.location.href = `/chat/${data.room._id}`;
                }}
                className="mt-2 text-sm text-blue-600"
              >
                Chat privately
              </button>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
