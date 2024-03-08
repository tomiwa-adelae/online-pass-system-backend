import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

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

	if (matricNumber.length !== 8 && matricNumber.length !== 11) {
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
	const users = await User.find({}).sort({ createdAt: -1 });
	res.json(users);
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

export { authUser, registerUser, getUsers, updateUser };
