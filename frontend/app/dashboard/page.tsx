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
import { useRef, useState } from "react";

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
    console.log("Destination Latutude :", lat, " Longitude :", lng);
    setMapCenter({ lat, lng });

    // Call backend
    setLoading(true);

    const res = await fetch("/api/match/by-destination", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });

    const data = await res.json();
    setStudents(data || []);
    setLoading(false);
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
