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
const SLOT_SIZE = 600; // 10 minutes in seconds

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

  // Fetch logged-in user
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/protected/user");
      const jsonData = await res.json();
      setEmail(jsonData.user.email);
    })();
  }, []);

  const normalizeSlot = (unixSeconds: number) =>
    Math.floor(unixSeconds / SLOT_SIZE) * SLOT_SIZE;

  const handleFindMatches = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time.");
      return;
    }

    if (!selectedLocation) {
      alert("Please select a destination.");
      return;
    }

    const combined = new Date(`${selectedDate}T${selectedTime}`);
    const unixSeconds = Math.floor(combined.getTime() / 1000);
    const normalizedSlot = normalizeSlot(unixSeconds);

    const now = Math.floor(Date.now() / 1000);
    if (normalizedSlot < now) {
      alert("Cannot book past time.");
      return;
    }

    try {
      setLoading(true);

      const { lat, lng } = selectedLocation;

      // 1️⃣ Book slot
      await fetch("/api/protected/geo/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: email.toLowerCase(),
          latitude: lat,
          longitude: lng,
          slot: normalizedSlot,
        }),
      });

      // 2️⃣ Fetch nearby users
      const res = await fetch(
        `/api/protected/geo/nearby?lat=${lat}&lng=${lng}&radius=1&slot=${normalizedSlot}&genderFilter=${genderFilter}`,
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
      <span className="text-4xl">🗺️</span>
      <Heading className="font-black">Destination Match</Heading>

      <Paragraph className="mt-4 max-w-xl">
        Select a date, time, destination and find nearby students.
      </Paragraph>

      {/* Date Picker */}
      <div className="mt-6">
        <label className="block mb-2 font-semibold">Select Date</label>
        <input
          type="date"
          className="w-full p-3 border rounded-lg"
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
          step="600"
          className="w-full p-3 border rounded-lg"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        />
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

      {/* Destination Search */}
      <div className="mt-6">
        <Autocomplete
          onLoad={(auto) => (autocompleteRef.current = auto)}
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
            placeholder="Search destination"
            className="w-full p-3 border rounded-lg"
          />
        </Autocomplete>
      </div>

      {/* Map */}
      <div className="mt-6 h-[400px] w-full rounded-xl overflow-hidden border">
        <GoogleMap
          center={mapCenter}
          zoom={14}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </div>

      {/* Find Matches Button */}
      <button
        onClick={handleFindMatches}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Find Matches
      </button>

      {/* Results */}
      {loading && <p className="mt-6 text-gray-500">Finding students...</p>}

      {!loading && students.length > 0 && (
        <div className="grid gap-4 mt-8">
          {students.map((student) => (
            <div
              key={student._id}
              className="p-4 rounded-xl border bg-white shadow-sm"
            >
              <h3 className="font-semibold">{student.name}</h3>
              <p className="text-sm text-blue-600">
                {student.distance.toFixed(2)} km away
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && students.length === 0 && selectedLocation && (
        <p className="mt-6 text-gray-500">No students found for this slot.</p>
      )}
    </Container>
  );
}
