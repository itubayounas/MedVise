import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authrouter from './routes/authRoutes.js';
import journalRouter from './routes/journalRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import appointmentRouter from './routes/appointmentRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authrouter);
app.use("/api/journals", journalRouter);
app.use("/api/admin", adminRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/doctor", doctorRouter);

app.get("/", (req, res) => res.send("Backend Running"));

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
