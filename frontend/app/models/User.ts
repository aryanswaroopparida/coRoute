import mongoose from "mongoose";
import { nitwEmailRegex } from "../lib/utils";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [nitwEmailRegex, "Only NITW student emails are allowed"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      // select: false,
    },
    gender: {
      type: String,
    },
    profilepic: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
