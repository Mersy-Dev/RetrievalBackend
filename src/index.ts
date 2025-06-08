import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import documentRoutes from "./routes/documentRoutes";
import prisma from './config/database'; // Ensure database connection
import { FRONTEND_URL } from './config/config';


dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;


// Middleware
app.use(
  cors({
    origin: FRONTEND_URL, // Allow only your frontend origin
    credentials: true, // Allow cookies and authentication headers
  }),
);
app.use(express.json());
app.use(cors());

app.use("/api/documents", documentRoutes);



// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Route Not Found' });
});

// Global Error Handler (must be the last middleware)
// app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Gracefully handle Prisma disconnection when the server stops
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
