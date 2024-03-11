import express from "express";

import {
	registerUser,
	authUser,
	getUsers,
	updateUser,
	updatePassword,
	logoutUser,
	getUser,
	resetPassword,
	verifyCode,
	updateNewPassword,
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, admin, getUsers);
router.get("/:id", protect, admin, getUser);
router.post("/auth", authUser);
router.route("/profile").put(protect, updateUser);
router.route("/resetpassword").post(resetPassword);
router.route("/verifycode").post(verifyCode);
router.route("/updatepassword/:id/:code").post(updateNewPassword);
router.route("/password").put(protect, updatePassword);
router.post("/logout", logoutUser);

export default router;
