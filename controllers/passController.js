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
		locationOfDeparture,
		reason,
	} = req.body;

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
		locationOfDeparture,
		reason,
	});

	if (pass) {
		res.status(201).json(pass);
	} else {
		res.status(401);
		throw new Error("An error occured! Please try again later");
	}
});

export { getPasses, createPass };
