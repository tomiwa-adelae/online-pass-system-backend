import express from "express";

import {
	registerUser,
	authUser,
	getUsers,
	updateUser,
	updatePassword,
	logoutUser,
	getUser,
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, admin, getUsers);
router.get("/:id", protect, admin, getUser);
router.post("/auth", authUser);
router.route("/profile").put(protect, updateUser);
router.route("/password").put(protect, updatePassword);
router.post("/logout", logoutUser);

export default router;
