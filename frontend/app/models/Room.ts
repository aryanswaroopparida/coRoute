import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["group", "personal"],
    required: true,
  },

  slot: {
    type: Number,
    index: true,
  },

  participants: {
    type: [String], // emails
    index: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
  },
});

// GROUP ROOM UNIQUE PER SLOT
RoomSchema.index(
  { type: 1, slot: 1 },
  { unique: true, partialFilterExpression: { type: "group" } },
);

// PERSONAL ROOM UNIQUE PER PARTICIPANT PAIR
RoomSchema.index(
  { type: 1, participants: 1 },
  { unique: true, partialFilterExpression: { type: "personal" } },
);

// AUTO DELETE GROUP ROOMS
RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
