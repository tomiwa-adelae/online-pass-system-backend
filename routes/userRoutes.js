import express from "express";

import {
	registerUser,
	authUser,
	getUsers,
	updateUser,
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, admin, getUsers);
router.post("/auth", authUser);
router.route("/profile").put(protect, updateUser);

export default router;
