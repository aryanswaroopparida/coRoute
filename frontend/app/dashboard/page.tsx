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

  useEffect(() => {
    try {
      (async () => {
        const res = await fetch("/api/protected/user");
        let jsonData = await res.json();
        console.log("jsonData :", jsonData);
        setEmail(jsonData.user.email);
      })();
    } catch (error) {}
  }, []);

  const [mapCenter, setMapCenter] = useState({
    lat: 17.9689, // NITW default
    lng: 79.5941,
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onPlaceChanged = async () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });

    // const email = "student@example.com";

    try {
      setLoading(true);

      // 1️⃣ Update user location in Redis
      await fetch("/api/protected/geo/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: email.toLowerCase(),
          latitude: lat,
          longitude: lng,
        }),
      });

      // 2️⃣ Fetch nearby users (5km default)
      const res = await fetch(
        `/api/protected/geo/nearby?lat=${lat}&lng=${lng}&radius=1`,
      );

      const data = await res.json();

      // Remove self from results
      const filtered = data.users?.filter(
        (id: string) => id !== email.toLowerCase(),
      );

      // Map into Student format
      const formatted: Student[] =
        filtered?.map((id: string) => ({
          _id: id,
          name: id.split("@")[0],
          destination: place.formatted_address || "Unknown",
          distance: 0, // We'll improve this later
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
      <Heading className="font-black">NITW Destination Match</Heading>

      <Paragraph className="mt-4 max-w-xl">
        Search a destination and find students traveling there.
      </Paragraph>

      {/* Google Autocomplete */}
      <div className="mt-8">
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
          onPlaceChanged={onPlaceChanged}
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

      {/* Student Results */}
      {loading && <p className="mt-6 text-gray-500">Finding students...</p>}

      {!loading && students.length > 0 && (
        <div className="grid gap-4 mt-8">
          {students.map((student) => (
            <div
              key={student._id}
              className="p-4 rounded-xl border bg-white shadow-sm"
            >
              <h3 className="font-semibold">{student.name}</h3>
              <p className="text-sm text-gray-500">
                Destination: {student.destination}
              </p>
              <p className="text-sm text-blue-600">
                {student.distance.toFixed(2)} km away
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && students.length === 0 && selectedLocation && (
        <p className="mt-6 text-gray-500">
          No students found for this destination.
        </p>
      )}
    </Container>
  );
}
