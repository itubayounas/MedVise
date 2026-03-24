import express from "express";
import { createAppointment, getPatientAppointments } from "../controllers/appointmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// patient creates and views their appointments
router.post("/", authMiddleware, createAppointment);
router.get("/", authMiddleware, getPatientAppointments);

export default router;
