import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "../config/db.js";

import authrouter from "../routes/authRoutes.js";
import journalRouter from "../routes/journalRoutes.js";
import adminRouter from "../routes/adminRoutes.js";
import appointmentRouter from "../routes/appointmentRoutes.js";
import doctorRouter from "../routes/doctorRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authrouter);
app.use("/api/journals", journalRouter);
app.use("/api/admin", adminRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/doctor", doctorRouter);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// DB cache for Vercel
let isConnected = false;

async function connect() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

// ❗ EXPORT EXPRESS APP FOR LOCAL USE
export { app };

// ❗ VERCEL HANDLER
export default async function handler(req, res) {
  await connect();
  return app(req, res);
}