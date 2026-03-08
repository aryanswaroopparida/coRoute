import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["group", "personal"],
    required: true,
  },

  slot: Number,

  participants: [String], // email

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
