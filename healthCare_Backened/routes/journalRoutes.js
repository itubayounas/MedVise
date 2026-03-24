import express from "express";
import {
  createJournal,
  getJournals,
  getJournal,
  updateJournal,
  deleteJournal
} from "../controllers/journalController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// protect all journal routes
router.use(authMiddleware);

router.post("/", createJournal);
router.get("/", getJournals);
router.get("/:id", getJournal);
router.put("/:id", updateJournal);
router.delete("/:id", deleteJournal);

export default router;