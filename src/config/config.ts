import dotenv from "dotenv";

dotenv.config();

export const FRONTEND_URL = process.env.FRONTEND_URL ?? "";

// Check for missing Frontend and Base URLs
if (!FRONTEND_URL || FRONTEND_URL === "") {
  console.error("⚠️ Frontend URL is missing.");
  throw new Error("Frontend URL is missing");
}
