import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import bankRouter from "./routers/bankRouter.js";
import campRouter from "./routers/campRouter.js";

const app = express();
const port = process.env.PORT || 3177;

app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
    "http://localhost:3000",
    "https://red-hope-frontend.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow allowedOrigins
        if (allowedOrigins.includes(origin)) return callback(null, true);

        // Allow any Vercel deployment (previews, etc.)
        if (origin.endsWith(".vercel.app")) return callback(null, true);

        // For development, you might want to log the blocked origin to debug
        console.log("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));


// Modern async connection
async function start() {
  try {
    await mongoose.connect(process.env.CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // note: useCreateIndex removed in modern mongoose versions
    });
    console.log("Connected successfully to database");

    // Register routers AFTER successful DB connection (optional)
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/bank", bankRouter);
    app.use("/camps", campRouter);

    app.listen(port, () =>
      console.log(`Server running at http://localhost:${port}`)
    );
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // fail fast so you can fix config
  }
}

start();
