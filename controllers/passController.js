import dotenv from "dotenv";
dotenv.config();

import Mailjet from "node-mailjet";
import asyncHandler from "express-async-handler";
import Pass from "../models/passModel.js";

const mailjet = Mailjet.apiConnect(
	process.env.MAILJET_API_PUBLIC_KEY,
	process.env.MAILJET_API_PRIVATE_KEY
);

// Desc Get all passes as an admin
// @route GET /api/passes
// @access Private/Admin
const getPasses = asyncHandler(async (req, res) => {
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

	const passes = await Pass.find({ ...keyword }).sort({ createdAt: -1 });

	res.json(passes);
});

// Desc Get all user passes as an admin
// @route GET /api/passes/admin/userpasses/:id
// @access Private/Admin
const getUserPasses = asyncHandler(async (req, res) => {
	const passes = await Pass.find({ user: req.params.id }).sort({
		createdAt: -1,
	});

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
		const request = mailjet.post("send", { version: "v3.1" }).request({
			Messages: [
				{
					From: {
						Email: "thetommedia@gmail.com",
						Name: "Passify",
					},
					To: [
						{
							Email: `${req.user.email}`,
							Name: `${req.user.name}`,
						},
					],
					Subject: `Successful Exeat Pass Application - Pending`,
					TextPart: `Your exeat request is pending at the moment.`,
					HTMLPart: `<div 
									style="padding: 2rem;"
								>
									<img src='https://res.cloudinary.com/the-tom-media/image/upload/v1710179742/Passify/logo-primary_qx2hbo.png' />

									<p>Dear ${req.user.name},</p>

									<p>We hope this email finds you well. We am writing to inform you that your exeat pass application has been successfully submitted, although it is currently <strong>pending</strong> approval.</p>

									<p>In the meantime, if you have any questions or concerns regarding your exeat pass application or any other matter, please do not hesitate to reach out to us. We are here to assist you in any way we can.</p>

									<p>Thank you for your patience and understanding.</p>
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

	const passes = await Pass.find({ ...keyword, user: req.user._id }).sort({
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

		const request = mailjet.post("send", { version: "v3.1" }).request({
			Messages: [
				{
					From: {
						Email: "thetommedia@gmail.com",
						Name: "Passify",
					},
					To: [
						{
							Email: `${pass.email}`,
							Name: `${pass.name}`,
						},
					],
					Subject: `Approved Exeat Pass Application`,
					TextPart: `Your exeat request has been approved!`,
					HTMLPart: `<div 
									style="padding: 2rem;"
								>
									<img src='https://res.cloudinary.com/the-tom-media/image/upload/v1710179742/Passify/logo-primary_qx2hbo.png' />

									<p>Dear ${pass.name},</p>

									<p>I am pleased to inform you that your exeat pass application has been successfully <strong>approved</strong>. You are now authorized to proceed with your planned absence as per the details provided in your application.</p>

									<p>Your approved exeat pass will be available for collection on the website.</p>

									<p>We appreciate your cooperation throughout the application process and hope that your absence proves to be both productive and rejuvenating.</p>

									<p>Should you have any questions or require further assistance, please feel free to contact us.</p>

									<p>Thank you for your patience and understanding.</p>
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

		const request = mailjet.post("send", { version: "v3.1" }).request({
			Messages: [
				{
					From: {
						Email: "thetommedia@gmail.com",
						Name: "Passify",
					},
					To: [
						{
							Email: `${pass.email}`,
							Name: `${pass.name}`,
						},
					],
					Subject: `Rejected Exeat Pass Application`,
					TextPart: `Your exeat request has been rejected!`,
					HTMLPart: `<div 
									style="padding: 2rem;"
								>
									<img src='https://res.cloudinary.com/the-tom-media/image/upload/v1710179742/Passify/logo-primary_qx2hbo.png' />

									<p>Dear ${pass.name},</p>

									<p>I regret to inform you that your exeat pass application has been <strong>rejected</strong>. After careful consideration, we have determined that the reasons provided for your absence do not meet the criteria for approval.</p>

									<p>We understand that this decision may cause inconvenience, and we apologize for any disruption it may cause to your plans. If you wish to discuss the reasons for the rejection or require further clarification, please do not hesitate to contact us.</p>

									<p>We appreciate your understanding in this matter and hope for your cooperation in adhering to the necessary protocols and procedures for future applications.</p>

									<p>Thank you for your patience and understanding.</p>
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

		res.json(rejectPass);
	} else {
		res.status(404);
		throw new Error("Pass not found!");
	}
});

// Desc Get approved passes as an admin
// @route GET /api/passes/approvedPasses
// @access Private/Admin
const getApprovedPasses = asyncHandler(async (req, res) => {
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

	const passes = await Pass.find({ ...keyword, status: "Approved" }).sort({
		createdAt: -1,
	});

	res.send(passes);
});

// Desc Get rejected passes as an admin
// @route GET /api/passes/rejectedPasses
// @access Private/Admin
const getRejectedPasses = asyncHandler(async (req, res) => {
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
	const passes = await Pass.find({ ...keyword, status: "Rejected" }).sort({
		createdAt: -1,
	});

	res.send(passes);
});

// Desc Get pending passes as an admin
// @route GET /api/passes/pendingPasses
// @access Private/Admin
const getPendingPasses = asyncHandler(async (req, res) => {
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

	const passes = await Pass.find({ ...keyword, status: "Pending" }).sort({
		createdAt: -1,
	});

	res.send(passes);
});

export {
	getPasses,
	createPass,
	getMyPasses,
	getPassesById,
	approvePass,
	rejectPass,
	getApprovedPasses,
	getRejectedPasses,
	getPendingPasses,
	getUserPasses,
};
