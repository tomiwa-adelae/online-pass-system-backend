import mongoose from "mongoose";

const passSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		matricNumber: {
			type: String,
			required: true,
		},
		department: {
			type: String,
			required: true,
		},
		faculty: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		parentPhoneNumber: {
			type: String,
			required: true,
		},
		departureDate: {
			type: String,
			required: true,
		},
		location: {
			type: String,
			required: true,
		},
		hostel: {
			type: String,
			required: true,
		},
		reason: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			default: "Pending",
		},
	},
	{ timestamps: true }
);

const Pass = mongoose.model("Pass", passSchema);
export default Pass;
