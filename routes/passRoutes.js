import express from "express";

import {
	createPass,
	getMyPasses,
	getPasses,
	getPassesById,
	approvePass,
	rejectPass,
} from "../controllers/passController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createPass).get(protect, admin, getPasses);
router.route("/mine").get(protect, getMyPasses);
router.route("/:id").get(protect, getPassesById);
router.route("/:id/approve").put(protect, admin, approvePass);
router.route("/:id/reject").put(protect, admin, rejectPass);

export default router;
