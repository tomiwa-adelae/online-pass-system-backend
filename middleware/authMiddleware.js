// import jwt from "jsonwebtoken";
// import asyncHandler from "express-async-handler";
// import User from "../models/userModel.js";

// const protect = asyncHandler(async (req, res, next) => {
// 	let token;

// 	token = req.cookies.jwt;

// 	if (token) {
// 		try {
// 			const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 			req.user = await User.findById(decoded.userId).select("-password");

// 			next();
// 		} catch (error) {
// 			console.error(error);
// 			res.status(401);
// 			throw new Error("Not authorized, token failed");
// 		}
// 	} else {
// 		res.status(401);
// 		throw new Error("Not authorized, no token");
// 	}
// });

// // User must be an admin
// const admin = (req, res, next) => {
// 	if (req.user && req.user.isAdmin) {
// 		next();
// 	} else {
// 		res.status(401);
// 		throw new Error("Not authorized as an admin");
// 	}
// };

// export { protect, admin };

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
	const token = req.header("x-auth-token");

	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			if (!decoded.userId) {
				res.status(400);
				throw new Error("User not found!");
			}

			// @ts-ignore
			req.user = await User.findById(decoded.userId).select("-password");

			next();
		} catch (error) {
			console.error(error);
			res.status(401);
			throw new Error("Not authorized, token failed");
		}
	} else {
		res.status(401);
		throw new Error("Not authorized, no token");
	}
});

// User must be an admin
const admin = (req, res, next) => {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		res.status(401);
		throw new Error("Not authorized as an admin");
	}
};

export { protect, admin };
