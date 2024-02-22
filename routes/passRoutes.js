import express from "express";

import { createPass, getPasses } from "../controllers/passController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createPass).get(protect, admin, getPasses);
// router.post("/", createPass);

export default router;
