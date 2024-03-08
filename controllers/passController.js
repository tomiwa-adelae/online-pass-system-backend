import asyncHandler from "express-async-handler";
import Pass from "../models/passModel.js";

// Desc Get all passes as an admin
// @route GET /api/passes
// @access Private/Admin
const getPasses = asyncHandler(async (req, res) => {
	const passes = await Pass.find({}).sort({ createdAt: -1 });

	res.json(passes);
});

// Desc Create a pass request
// @route POST /api/passes
// @access Private
const createPass = asyncHandler(async (req, res) => {
	const { name, email, matricNumber, department, faculty, _id } = req.user;
	const {
		phoneNumber,
		parentPhoneNumber,
		departureDate,
		location,
		reason,
		hostel,
	} = req.body;


	if (
		!departureDate ||
		!location ||
		!phoneNumber ||
		!parentPhoneNumber ||
		!reason ||
		!hostel
	) {
		res.status(400);
		throw new Error("Please enter all fields!");
	}

	const pass = await Pass.create({
		user: _id,
		name,
		email,
		matricNumber,
		department,
		faculty,
		phoneNumber,
		parentPhoneNumber,
		departureDate,
		location,
		reason,
		hostel,
	});

	if (pass) {
		res.status(201).json(pass);
	} else {
		res.status(401);
		throw new Error("An error occured! Please try again later");
	}
});

// Desc Get all passes for a user
// @route GET /api/passes/mine
// @access Private
const getMyPasses = asyncHandler(async (req, res) => {
	const passes = await Pass.find({ user: req.user._id }).sort({
		createdAt: -1,
	});

	res.json(passes);
});

// Desc Get a single pass details
// @route GET /api/passes/:id
// @access Private
const getPassesById = asyncHandler(async (req, res) => {
	const pass = await Pass.findById(req.params.id);

	if (pass) {
		res.json(pass);
	} else {
		res.status(404);
		throw new Error("Pass not found!");
	}
});

// Desc Update pass request to approve
// @route PUT /api/passes/:id/approve
// @access Private/Admin
const approvePass = asyncHandler(async (req, res) => {
	const pass = await Pass.findById(req.params.id);

	if (pass) {
		pass.status = "Approved";

		const approvedPass = await pass.save();

		res.json(approvedPass);
	} else {
		res.status(404);
		throw new Error("Pass not found!");
	}
});

// Desc Update pass request to reject
// @route PUT /api/passes/:id/reject
// @access Private/Admin
const rejectPass = asyncHandler(async (req, res) => {
	const pass = await Pass.findById(req.params.id);

	if (pass) {
		pass.status = "Rejected";

		const rejectPass = await pass.save();

		res.json(rejectPass);
	} else {
		res.status(404);
		throw new Error("Pass not found!");
	}
});

export {
	getPasses,
	createPass,
	getMyPasses,
	getPassesById,
	approvePass,
	rejectPass,
};
