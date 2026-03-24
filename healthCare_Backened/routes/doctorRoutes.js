import express from "express";
import {
  getDoctorAppointments,
  approveAppointment,
  rejectAppointment
} from "../controllers/appointmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import doctorMiddleware from "../middleware/doctorMiddleware.js";

const router = express.Router();

router.use(authMiddleware, doctorMiddleware);

router.get("/appointments", getDoctorAppointments); // optional ?status=Pending
router.put("/appointments/:id/approve", approveAppointment);
router.put("/appointments/:id/reject", rejectAppointment);

export default router;
