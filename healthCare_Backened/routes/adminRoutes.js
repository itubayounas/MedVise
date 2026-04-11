import express from "express";
import { getPendingDoctors, approveDoctor,getAllDoctors, getStats, getAllUsers } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/pending-doctors", getPendingDoctors);
router.put("/approve/:id", approveDoctor);
router.get("/stats", getStats);
router.get("/all-doctors", getAllDoctors);
router.get("/all-users", getAllUsers);

export default router;
