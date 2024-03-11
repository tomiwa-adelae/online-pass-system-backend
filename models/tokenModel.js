import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		code: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		expires: 3600,
	}
);

const Token = mongoose.model("Token", tokenSchema);

export default Token;
