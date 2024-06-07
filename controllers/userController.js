import dotenv from "dotenv";
dotenv.config();

import Mailjet from "node-mailjet";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import generateToken from "../utils/generateToken.js";

const mailjet = Mailjet.apiConnect(
	process.env.MAILJET_API_PUBLIC_KEY,
	process.env.MAILJET_API_PRIVATE_KEY
);

// Desc Auth user & get the token
// @route POST /api/users/auth
// @access public
const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });
	if (user && (await user.matchPassword(password))) {
		generateToken(res, user._id);

		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			matricNumber: user.matricNumber,
			department: user.department,
			faculty: user.faculty,
			profilePicture: user.profilePicture,
			phoneNumber: user.phoneNumber,
			address: user.address,
			parentPhoneNumber: user.parentPhoneNumber,
			isAdmin: user.isAdmin,
		});
	} else {
		res.status(401);
		throw new Error("Invalid email or password!");
	}
});

// Desc Register user & get the token
// @route POST /api/users
// @access public
const registerUser = asyncHandler(async (req, res) => {
	const { name, email, matricNumber, department, faculty, password } =
		req.body;

	if (
		!name ||
		!email ||
		!matricNumber ||
		!department ||
		!faculty ||
		!password
	) {
		res.status(400);
		throw new Error("Please enter all fields!");
	}

	if (matricNumber.length < 8 && matricNumber.length > 12) {
		res.status(400);
		throw new Error("Invalid matriculation/admission number!");
	}

	if (password.length <= 5) {
		res.status(400);
		throw new Error("Password should be at least 6 character!");
	}

	const matricNumberExist = await User.findOne({ matricNumber });

	if (matricNumberExist) {
		res.status(400);
		throw new Error("Matriculation/Admission already exist! Please login");
	}

	const userExist = await User.findOne({ email });
	if (userExist) {
		res.status(400);
		throw new Error("User already exist! Please login");
	}

	const user = await User.create({
		name,
		email,
		matricNumber,
		department,
		faculty,
		password,
	});
	if (user) {
		generateToken(res, user._id);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			matricNumber: user.matricNumber,
			department: user.department,
			faculty: user.faculty,
			profilePicture: user.profilePicture,
			phoneNumber: user.phoneNumber,
			address: user.address,
			parentPhoneNumber: user.parentPhoneNumber,
			isAdmin: user.isAdmin,
		});
	} else {
		res.status(401);
		throw new Error("An error occured! Please try again later");
	}
});

// Desc Get all the users as an admin
// @route GET /api/users
// @access Private/admin
const getUsers = asyncHandler(async (req, res) => {
	const keyword = req.query.keyword
		? {
				$or: [
					{
						name: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						email: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						matricNumber: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						department: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						faculty: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						location: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						hostel: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						reason: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						status: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
				],
		  }
		: {};

	const users = await User.find({ ...keyword }).sort({ createdAt: -1 });
	res.json(users);
});

// Desc Get user details as an admin
// @route GET /api/users/:id
// @access Private/admin
const getUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select("-password");

	if (user) {
		res.json(user);
	} else {
		res.status(401);
		throw new Error("An error occured! User not found!");
	}
});

// Desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
		user.name = req.body.name || user.name;
		user.email = req.body.email || user.email;
		user.matricNumber = req.body.matricNumber || user.matricNumber;
		user.department = req.body.department || user.department;
		user.faculty = req.body.faculty || user.faculty;
		user.address = req.body.address || user.address;
		user.parentPhoneNumber =
			req.body.parentPhoneNumber || user.parentPhoneNumber;
		user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

		const updatedUser = await user.save();

		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			matricNumber: updatedUser.matricNumber,
			department: updatedUser.department,
			faculty: updatedUser.faculty,
			profilePicture: updatedUser.profilePicture,
			phoneNumber: updatedUser.phoneNumber,
			address: updatedUser.address,
			parentPhoneNumber: updatedUser.parentPhoneNumber,
			isAdmin: updatedUser.isAdmin,
		});
	} else {
		res.status(401);
		throw new Error("An error occured! User not found!");
	}
});

// Desc Update user password
// @route PUT /api/users/password
// @access Private
const updatePassword = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	const { currentPassword, newPassword, confirmPassword } = req.body;

	if (user) {
		if (!currentPassword || !newPassword || !confirmPassword) {
			res.status(401);
			throw new Error("Please enter all fields!");
		}

		if (newPassword !== confirmPassword) {
			res.status(401);
			throw new Error("Passwords do not match!");
		}

		if (newPassword.length <= 5) {
			res.status(400);
			throw new Error("Passwords should be at least 6 character!");
		}

		if (user && (await user.matchPassword(currentPassword))) {
			user.password = newPassword;

			await user.save();

			res.status(201).json({ message: "Password successfully updated!" });
		} else {
			res.status(401);
			throw new Error("Invalid current password!");
		}
	} else {
		res.status(404);
		throw new Error("An error occured! User not found!");
	}
});

// Desc Logout user
// @route PUT /api/users/logout
// @access Private
const logoutUser = (req, res) => {
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0),
	});

	res.status(200).json({ message: "Logged out successfully!" });
};

// Desc Reset password
// @route POST /api/users/resetpassword
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	if (!email) {
		res.status(400);
		throw new Error("Please enter email address!");
	}

	const user = await User.findOne({ email });

	if (user) {
		let token = await Token.findOne({ userId: user._id });

		if (!token) {
			token = await new Token({
				userId: user._id,
				code: Math.floor(100000 + Math.random() * 900000),
			}).save();

			const request = mailjet.post("send", { version: "v3.1" }).request({
				Messages: [
					{
						From: {
							Email: "thetommedia@gmail.com",
							Name: "Passify",
						},
						To: [
							{
								Email: `${email}`,
								Name: `${user.name}`,
							},
						],
						Subject: `Verification code`,
						TextPart: `Your verification code is : ${token.code}`,
						HTMLPart: `<div 
										style="
											font-family: Montserrat, sans-serif;
											font-size: 15px;
											padding: 2rem;
										"
									>
										<img src='https://res.cloudinary.com/the-tom-media/image/upload/v1710179742/Passify/logo-primary_qx2hbo.png' />

										<p>We received a request to reset the password for your account. To proceed with the password reset process, please use the following verification code:</p>

										<h5>Your verification code is: </h5>

										<h1>${token.code}</h1>

										<p>Please enter this code on the password reset page to complete the process. There's nothing to do or worry about if it wasn't you. You can keep on keeping on.</p>

										<p>Thank you for your attention to this matter.</p>
										<p>Best regards,</p>
										<p>&copy; 2024 Passify. All Rights Reserved</p>
									</div>
							`,
					},
				],
			});

			// Send email
			request
				.then(() => {
					res.status(201).json({ msg: "Email sent successfully!" });
					return;
				})
				.catch((err) => {
					return err;
				});
		} else {
			res.status(401);
			throw new Error(
				"A password reset link has already been dispatched to your email!"
			);
		}
	} else {
		res.status(401);
		throw new Error(
			"The email provided doesn't match any existing user! Please sign up now!"
		);
	}
});

// Desc Verify code
// @route POST /api/users/verifycode
// @access Public
const verifyCode = asyncHandler(async (req, res) => {
	const { email, code } = req.body;

	const user = await User.findOne({ email });

	if (user) {
		const token = await Token.findOne({ userId: user._id, code });

		if (token) {
			res.status(200).json({ id: user._id, message: "Verified!" });
		} else {
			res.status(401);
			throw new Error("Invalid reset code!");
		}
	} else {
		res.status(401);
		throw new Error("Invalid reset code!");
	}
});

// Desc Update user new passwords
// @route POST /api/users/updatenewpassword/:id/:code
// @access Public
const updateNewPassword = asyncHandler(async (req, res) => {
	const { id, code, newPassword, confirmPassword } = req.body;

	if (!newPassword || !confirmPassword) {
		res.status(401);
		throw new Error("Please enter all fields!");
	}

	if (newPassword !== confirmPassword) {
		res.status(401);
		throw new Error("Passwords do not match!");
	}

	if (newPassword.length <= 5) {
		res.status(400);
		throw new Error("Passwords should be at least 6 character!");
	}

	const user = await User.findById(id);

	if (user) {
		const token = await Token.findOne({
			userId: user._id,
			code,
		});

		if (!token) {
			res.status(401);
			throw new Error("Invalid reset code! Please try again");
		}
		user.password = newPassword;

		await user.save();

		await token.deleteOne({ userId: token.userId });

		res.status(201).json({ message: "Password successfully updated!" });
	} else {
		res.status(401);
		throw new Error("An error occured!User not found !");
	}
});

export {
	authUser,
	registerUser,
	getUsers,
	getUser,
	updateUser,
	updatePassword,
	logoutUser,
	resetPassword,
	verifyCode,
	updateNewPassword,
};
