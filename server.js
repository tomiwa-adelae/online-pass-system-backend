// Importing the required files
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import passRoutes from "./routes/passRoutes.js";

// initializing the express app
const app = express();

// Express bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	res.setHeader(
		"Access-Control-Allow-Origin",
		"https://passify-eight.vercel.app/"
	);
	res.setHeader("Access-Control-Allow-Methods", "*");
	res.setHeader("Access-Control-Allow-Headers", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	next();
});

// Making cross origin request possible
// app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(
	cors({
		credentials: true,
		// origin: "https://passify-eight.vercel.app/"
	})
);

// Allowing cookies
app.use(cookieParser());

// Connect MongoDB database
connectDB();

// API routes
app.use("/api/users", userRoutes);
app.use("/api/passes", passRoutes);

app.get("/", (req, res) => {
	res.send("API is running....");
});

// Error middlewares
app.use(notFound);
app.use(errorHandler);

// Making the express app listen at a port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
	console.log(`Server started in ${process.env.NODE_ENV} at port ${PORT}`)
);
