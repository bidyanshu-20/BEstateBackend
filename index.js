import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import authrouter from "./routes/auth.routes.js";
import listingRouter from "./routes/listing.route.js";
import cors from "cors";

dotenv.config();

// Connect to Mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

// CORS FIX (MOST IMPORTANT)
app.use(
  cors({
    origin: "https://b-estate-frontend.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    optionsSuccessStatus: 200,
  })
);

// Trust proxy for Vercel
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
  res.send("Hello world!");
});

// Routes
app.use("/api/auth", authrouter);
app.use("/api/user", userRouter);
app.use("/api/listing", listingRouter);

// Error Handler
app.use((err, req, resp, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return resp.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// PORT FIX
const PORT = process.env.PORT || 3000;
app.listen(PORT);
