"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { Camera, Loader2, User, Mail, UserCircle, Users } from "lucide-react";
import { uploadProfilePicture } from "@/app/utils/cloudinary";

export default function ProfilePage() {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // User Data States
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/protected/user");
        const jsonData = await res.json();

        if (jsonData.user) {
          setName(jsonData.user.name);
          setEmail(jsonData.user.email);
          setGender(jsonData.user.gender == "girls" ? "Female" : "Male");
          setProfileUrl(jsonData.user.profilepic || null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserData();
  }, []);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => setImage(reader.result as string);
    }
  };

  const handleSaveCrop = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsUploading(true);

    try {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => (img.onload = resolve));

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");

      ctx?.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg"),
      );

      const formData = new FormData();
      formData.append("image", blob);
      const secureUrl = (await uploadProfilePicture(formData)) as string;

      const dbResponse = await fetch("/api/protected/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: secureUrl }),
      });

      const dbData = await dbResponse.json();

      if (dbData.success) {
        setProfileUrl(secureUrl);
        setImage(null);
        alert("Profile picture updated successfully!");
      } else {
        throw new Error(dbData.error || "Failed to update database");
      }
    } catch (e) {
      console.error("Profile update error:", e);
      alert("Something went wrong during the upload.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 p-8border rounded-3xl shadow-sm">
      <h1 className="text-2xl font-bold mb-8 text-center">My Profile</h1>

      {/* --- Profile Photo Section --- */}
      <div className="flex flex-col items-center gap-6 mb-10">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4  shadow-md">
            {profileUrl ? (
              <img
                src={profileUrl}
                className="w-full h-full object-cover"
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={64} />
              </div>
            )}
          </div>
          <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
            <Camera size={20} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <p className="text-sm text-slate-400">
          Click the camera to update photo
        </p>
      </div>

      {/* --- Profile Details Section --- */}
      <div className="space-y-6 pt-8 p-6 rounded-2xl">
        <h2 className="text-lg font-semibol mb-4">Account Details</h2>

        <div className="grid grid-cols-1 gap-5">
          {/* Name Display */}
          <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <UserCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Full Name
              </p>
              <p className="text-slate-800 font-medium">{name || "N/A"}</p>
            </div>
          </div>

          {/* Email Display */}
          <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                NITW Email
              </p>
              <p className="text-slate-800 font-medium">{email}</p>
            </div>
          </div>

          {/* Gender Display */}
          <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="bg-pink-50 p-2 rounded-lg text-pink-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Gender
              </p>
              <p className="text-slate-800 font-medium capitalize">{gender}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Image Cropper Modal --- */}
      {image && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden relative shadow-2xl">
            <div className="h-96 relative bg-slate-900">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setImage(null)}
                  className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCrop}
                  disabled={isUploading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex justify-center disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Save Photo"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
