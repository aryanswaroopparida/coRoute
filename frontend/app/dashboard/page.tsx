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
  _id: string;
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

    try {
      setLoading(true);

      const { lat, lng } = selectedLocation;

      // Book slot
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

      // Fetch nearby users
      const res = await fetch(
        `/api/protected/geo/nearby?lat=${lat}&lng=${lng}&radius=${radius}&slot=${slotUnix}&genderFilter=${genderFilter}`,
      );

      const data = await res.json();

      const filtered = data.users?.filter(
        (id: string) => id !== email.toLowerCase(),
      );

      const formatted: Student[] =
        filtered?.map((id: string) => ({
          _id: id,
          name: id.split("@")[0],
          destination: "Selected Destination",
          distance: 0,
        })) || [];

      setStudents(formatted);
    } catch (err) {
      console.error(err);
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

      {/* Match Now Toggle */}
      <div className="mt-6 flex items-center gap-2">
        <input
          type="checkbox"
          checked={matchNow}
          onChange={(e) => setMatchNow(e.target.checked)}
        />
        <label className="font-semibold">Match Now (Next 10 min)</label>
      </div>

      {/* Date Picker */}
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

      {/* Time Picker */}
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

      {/* Radius Selector */}
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

      {/* Gender Preference */}
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

      {/* Destination */}
      <div className="mt-6">
        <Autocomplete
          onLoad={(auto) => {
            autocompleteRef.current = auto;

            // Bias towards Telangana
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
            componentRestrictions: { country: "in" }, // Restrict to India
            // types: ["(cities)"], // Prefer cities
          }}
        >
          <input
            type="text"
            placeholder="Search destination (e.g. Warangal)"
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
            <div
              key={student._id}
              className="p-4 rounded-xl border bg-white shadow-sm"
            >
              <h3 className="font-semibold">{student.name}</h3>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
