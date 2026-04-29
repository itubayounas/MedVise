import express from "express";
import { getPendingDoctors, approveDoctor, getStats, getAllDoctors, getAllUsers, rejectDoctor, getAllDoctorsAdmin } from "../controllers/adminController.js";
import authMiddleware   from "../middleware/authMiddleware.js";
import adminMiddleware  from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/all-doctors", authMiddleware, getAllDoctors);   // patients can access



router.use(authMiddleware, adminMiddleware);
router.get("/pending-doctors", getPendingDoctors);
router.get("/all-doctors-admin",    getAllDoctorsAdmin); 
router.get("/all-users",         getAllUsers);
router.put("/approve/:id",     approveDoctor);
router.delete("/reject/:id", rejectDoctor);
router.get("/stats",           getStats);

export default router;