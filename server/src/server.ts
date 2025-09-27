import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import claimRoutes from "./routes/claim.route";
import policyRoutes from "./routes/policy.route";
dotenv.config();
const app: Express = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = (process.env.CORS_ORIGINS ?? "").split(",");
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" ? "*" : allowedOrigins,
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
if (process.env.NODE_ENV === "development") {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}
const MONGODB_URI = process.env.MONGODB_URI!;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
app.use("/api/claims", claimRoutes);
app.use("/api/policies", policyRoutes);
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
});
