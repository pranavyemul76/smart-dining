import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import restaurantOwnerRoutes from "./routes/restaurantOwnerRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const host = process.env.VERCEL_URL;
const port = process.env.PORT || 8080;
const app = express();
// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }),
);
app.use(express.json({ limit: "50mb" }));

// Request Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - UserID: ${req.headers["x-user-id"]}`);
  next();
});

// Routes
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/restaurant-owners", restaurantOwnerRoutes);
app.use("/api/users", userRoutes);
//Deployement
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/smart_dining";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// Routes placeholder

// Start Server

app.listen(port, host, () => {
  console.log(`server run on ${port}`);
});
