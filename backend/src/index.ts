// import express, { Request, Response } from "express";
// import cors from "cors";
// import "dotenv/config";
// import mongoose from "mongoose";
// import userRoutes from "./routes/users";
// import authRoutes from "./routes/auth";
// import cookieParser from "cookie-parser";
// import path from "path";
// import { v2 as cloudinary } from "cloudinary";
// import myHotelRoutes from "./routes/my-hotels";
// import hotelRoutes from "./routes/hotels";
// import bookingRoutes from "./routes/my-bookings";
// import paymentRoutes from "./routes/payment";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const connection = mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
// connection.then(() => {
//   console.log("Database connectrd succesfully");
// })
//   .catch((err) => {
//   console.error("Database connection Failed ",err)
// })

// const app = express();

// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.options(
//   "*",
//   cors({
//     origin: ["https://sparkly-brioche-d09a09.netlify.app",],
//     methods: ["POST", "GET", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//     preflightContinue: true,
//   })
// );
// app.use(
//   cors({
//     origin: ["https://sparkly-brioche-d09a09.netlify.app", ],
//     methods: ["POST", "GET", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//     maxAge: 86400,
    
//   })
// );



// app.use(express.static(path.join(process.cwd(),'https://sparkly-brioche-d09a09.netlify.app/')));

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/my-hotels", myHotelRoutes);
// app.use("/api/hotels", hotelRoutes);
// app.use("/api/my-bookings", bookingRoutes);
// app.use("/api/payment", paymentRoutes);

// app.get("*", (req: Request, res: Response) => {
//   res.sendFile(path.join(process.cwd(),'https://sparkly-brioche-d09a09.netlify.app/'));
// });

// app.listen(7000, () => {
//   console.log("server running on localhost:7000");
// });



import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import { v2 as cloudinary } from "cloudinary";

// Import routes
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";
import bookingRoutes from "./routes/my-bookings";
import paymentRoutes from "./routes/payment";

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error("Cloudinary configuration is missing");
  process.exit(1);
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });

const app = express();

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["https://sparkly-brioche-d09a09.netlify.app"],
  methods: ["POST", "GET", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Serve static files for frontend (if needed)
// Uncomment if frontend files are hosted locally
// app.use(express.static(path.join(__dirname, "dist")));
// app.get("*", (req: Request, res: Response) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.message || err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
