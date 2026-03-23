"use client";

import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { useRef, useState, useEffect } from "react";

const libraries: "places"[] = ["places"];
const SLOT_SIZE = 600;

type Student = {
  email: string;
  name: string;
  destination: string;
  distance: number;
};

type GroupRoom = {
  _id: string;
  participants: string[];
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
  const [groupMatch, setGroupMatch] = useState<GroupRoom | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 17.9689, lng: 79.5941 });
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: data.matchedSlot || slotUnix,
          participants,
        }),
      });
      const roomData = await roomRes.json();
      setGroupMatch(roomData.room);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-muted-foreground tracking-widest uppercase">
          Loading Maps…
        </p>
      </div>
    );

  const inputClass =
    "w-full border rounded-xl px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100";

  const selectClass =
    "w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition appearance-none cursor-pointer bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100";

  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest mb-1.5 text-gray-400 dark:text-gray-500";

  const cardClass =
    "border rounded-2xl p-5 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10";

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-14 pb-20">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 tracking-widest uppercase">
              Live Matching
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Destination Match
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Find travel companions heading your way — instantly or by schedule.
          </p>
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Match Now */}
          <div className={cardClass}>
            <p className={labelClass}>Mode</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMatchNow((v) => !v)}
                className={`relative w-12 h-6 rounded-full border transition-all duration-300 focus:outline-none ${
                  matchNow
                    ? "bg-gradient-to-r from-emerald-400 to-indigo-500 border-transparent shadow-lg shadow-indigo-500/30"
                    : "bg-gray-200 dark:bg-white/10 border-gray-300 dark:border-white/10"
                }`}
                aria-pressed={matchNow}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                    matchNow ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {matchNow ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded">
                      NOW
                    </span>
                    Next 10 min
                  </span>
                ) : (
                  "Schedule for later"
                )}
              </span>
            </div>
          </div>

          {/* Date & Time */}
          <div
            className={`${cardClass} ${matchNow ? "opacity-40 pointer-events-none" : ""} transition-opacity`}
          >
            <p className={labelClass}>When</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  disabled={matchNow}
                  className={inputClass}
                  style={{ colorScheme: "inherit" }}
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Time</label>
                <input
                  type="time"
                  disabled={matchNow}
                  step="600"
                  className={inputClass}
                  style={{ colorScheme: "inherit" }}
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={`${cardClass} sm:col-span-2`}>
            <p className={labelClass}>Filters</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Radius</label>
                <div className="relative">
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className={selectClass}
                  >
                    <option value={1}>1 km</option>
                    <option value={2}>2 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Time Window</label>
                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) =>
                      setTimeRange(e.target.value as "10" | "30" | "60")
                    }
                    className={selectClass}
                  >
                    <option value="10">Next 10 min</option>
                    <option value="30">Next 30 min</option>
                    <option value="60">Next 1 hr</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ▾
                  </span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>Gender</label>
                <div className="flex rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  {(["any", "girls", "boys"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
                        genderFilter === g
                          ? "bg-indigo-600 text-white"
                          : "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {g === "any"
                        ? "Anyone"
                        : g === "girls"
                          ? "Girls"
                          : "Boys"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className={`${cardClass} sm:col-span-2`}>
            <p className={labelClass}>Destination</p>
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
              options={{ componentRestrictions: { country: "in" } }}
            >
              <input
                type="text"
                placeholder="Search a destination…"
                className={inputClass}
              />
            </Autocomplete>

            <div className="mt-3 h-72 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
              <GoogleMap
                center={mapCenter}
                zoom={14}
                mapContainerStyle={{ width: "100%", height: "100%" }}
              >
                {selectedLocation && <Marker position={selectedLocation} />}
              </GoogleMap>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleFindMatches}
          disabled={loading}
          className="mt-5 w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Find Matches
            </>
          )}
        </button>

        {/* Group match result */}
        {groupMatch && (
          <div className="mt-6 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/25 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">
                Group Chat
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {groupMatch.participants.length} travellers matched
              </p>
            </div>
            <button
              onClick={() => {
                window.location.href = `/dashboard/chat/${groupMatch._id}`;
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
            >
              Join →
            </button>
          </div>
        )}

        {/* Private matches */}
        {!loading && students.length > 0 && (
          <div className="mt-4 border rounded-2xl p-5 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest mb-4 text-gray-400 dark:text-gray-500">
              Private Matches — {students.length} found
            </p>
            <div className="flex flex-col gap-2">
              {students.map((student) => (
                <div
                  key={student.email}
                  className="flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 border-gray-200 dark:border-white/10"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {student.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">
                      {student.name}
                    </p>
                    <p className="text-xs truncate text-gray-400 dark:text-gray-500">
                      {student.email}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch(
                        "/api/protected/chat/create-personal",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            userA: email,
                            userB: student.email,
                          }),
                        },
                      );
                      const data = await res.json();
                      window.location.href = `/dashboard/chat/${data.room._id}`;
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3.5 py-2 rounded-lg transition-all flex-shrink-0"
                  >
                    Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
