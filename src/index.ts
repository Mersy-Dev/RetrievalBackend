import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import documentRoutes from "./routes/documentRoutes";
import prisma from './config/database';
import { FRONTEND_URL } from './config/config';
import { errorHandler } from './utils/errors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(morgan("dev"));

// Optional: log all requests (for debugging)
// app.use((req, _res, next) => {
//   console.log(`➡️ ${req.method} ${req.url}`);
//   next();
// });

// Routes
app.use("/api/documents", documentRoutes);

// Test route
app.get("/api/ping", (_req, res) => {
  res.send("pong");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route Not Found' });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔌 Prisma disconnected. Server shutting down.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('🔌 Prisma disconnected. Server shutting down.');
  process.exit(0);
});
