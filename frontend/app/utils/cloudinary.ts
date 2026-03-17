"use server";

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadProfilePicture(formData: FormData) {
  try {
    const file = formData.get("image") as File;

    if (!file) {
      throw new Error("No file uploaded");
    }

    // Convert the File object to a Buffer for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using a promise wrapper
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "user_profiles",
            // 'face' gravity ensures Cloudinary also optimizes for the face
            // if you use their transformation URLs later
            gravity: "face",
            crop: "fill",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    // Return the secure URL to the frontend
    return (result as any).secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image");
  }
}
