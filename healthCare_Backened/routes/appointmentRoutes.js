import express from "express";
import {
  createAppointment,
  getPatientAppointments,
  getDoctorBookedSlots
} from "../controllers/appointmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",                      authMiddleware, createAppointment);
router.get("/",                       authMiddleware, getPatientAppointments);
router.get("/booked-slots/:id",       authMiddleware, getDoctorBookedSlots); // NEW

export default router;