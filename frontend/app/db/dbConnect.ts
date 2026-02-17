import configMap from "@/config/config";
import mongoose from "mongoose";
const DATABASE_URL = configMap.dbConnection;
if (!DATABASE_URL) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env.local"
  );
}

const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    console.log("DB connected successfully");
    return await mongoose.connect(DATABASE_URL);
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
};

export default dbConnect;
