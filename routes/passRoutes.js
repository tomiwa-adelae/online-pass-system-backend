import express from "express";

import {
	createPass,
	getMyPasses,
	getPasses,
	getPassesById,
	approvePass,
	rejectPass,
	getApprovedPasses,
	getRejectedPasses,
	getPendingPasses,
	getUserPasses,
} from "../controllers/passController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createPass).get(protect, admin, getPasses);
router.get("/admin/userpasses/:id", protect, admin, getUserPasses);
router.route("/approvedPasses").get(protect, admin, getApprovedPasses);
router.route("/rejectedPasses").get(protect, admin, getRejectedPasses);
router.route("/pendingPasses").get(protect, admin, getPendingPasses);
// router.get('/')
router.route("/mine").get(protect, getMyPasses);
router.route("/:id").get(protect, getPassesById);
router.route("/:id/approve").put(protect, admin, approvePass);
router.route("/:id/reject").put(protect, admin, rejectPass);

export default router;
