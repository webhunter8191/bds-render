// import express, { Request, Response } from "express";
// import { check, validationResult } from "express-validator";
// import User from "../models/user";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import verifyToken from "../middleware/auth";

// const router = express.Router();

// router.post(
//   "/login",
//   [
//     check("email", "Email is required").isEmail(),
//     check("password", "Password with 6 or more characters required").isLength({
//       min: 6,
//     }),
//   ],
//   async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ message: errors.array() });
//     }

//     const { email, password } = req.body;

//     try {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(400).json({ message: "Invalid Credentials" });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(400).json({ message: "Invalid Credentials" });
//       }

//       const token = jwt.sign(
//         { userId: user.id ,isAdmin:user.isAdmin},
//         process.env.JWT_SECRET_KEY as string,
//         {
//           expiresIn: "1d",
//         }
//       );

//       res.cookie("auth_token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 86400000,
//         domain:"https://sparkly-brioche-d09a09.netlify.app"
//       });
//       res.status(200).json({ userId: user._id });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Something went wrong" });
//     }
//   }
// );

// router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
//   res.status(200).send({ userId: req.userId ,isAdmin:req.isAdmin});
// });

// router.post("/logout", (req: Request, res: Response) => {
//   res.cookie("auth_token", "", {
//     expires: new Date(0),
//   });
//   res.send();
// });

// export default router;

// import express, { Request, Response } from "express";
// import { check, validationResult } from "express-validator";
// import User from "../models/user";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import verifyToken from "../middleware/auth";

// const router = express.Router();

// router.post(
//   "/login",
//   [
//     check("email", "Email is required").isEmail(),
//     check("password", "Password with 6 or more characters required").isLength({ min: 6 }),
//   ],
//   async (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ message: errors.array() });
//     }

//     const { email, password } = req.body;

//     try {
//       const user = await User.findOne({ email });
//       if (!user) {
//         return res.status(400).json({ message: "Invalid Credentials" });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(400).json({ message: "Invalid Credentials" });
//       }

//       const token = jwt.sign(
//         { userId: user.id, isAdmin: user.isAdmin },
//         process.env.JWT_SECRET_KEY as string,
//         { expiresIn: "1d" }
//       );

//       res.cookie("auth_token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "none",
//         maxAge: 86400000, // 1 day
//         domain: process.env.FRONTEND_URL 
//       });

//       res.status(200).json({ userId: user._id });
//     } catch (error) {
//       console.error("Error during login:", error);
//       res.status(500).json({ message: "Something went wrong" });
//     }
//   }
// );

// router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
//   console.log("Validated Token User:", { userId: req.userId, isAdmin: req.isAdmin });
//   res.status(200).send({ userId: req.userId, isAdmin: req.isAdmin });
// });

// router.post("/logout", (req: Request, res: Response) => {
//   res.cookie("auth_token", "", { expires: new Date(0), sameSite: "none", secure: process.env.NODE_ENV === "production" });
//   res.send();
// });

// export default router;




import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Helper function for environment variable validation
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required.`);
  }
  return value || defaultValue;
};

const JWT_SECRET_KEY = getEnvVar("JWT_SECRET_KEY");
const FRONTEND_URL = getEnvVar("FRONTEND_URL");
const NODE_ENV = getEnvVar("NODE_ENV", "development");
const COOKIE_SECURE = NODE_ENV === "production";

// Login route
router.post(
  "/login",
  [
    check("email", "Valid email is required").isEmail(),
    check("password", "Password with at least 6 characters is required").isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        JWT_SECRET_KEY,
        { expiresIn: "1d" }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: "none",
        maxAge: 86400000, // 1 day
        domain: FRONTEND_URL,
      });

      res.status(200).json({ userId: user._id });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Token validation route
router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).json({ userId: req.userId, isAdmin: req.isAdmin });
});

// Logout route
router.post("/logout", (req: Request, res: Response) => {
  res.cookie("auth_token", "", {
    expires: new Date(0),
    sameSite: "none",
    secure: COOKIE_SECURE,
  });
  res.status(200).send({ message: "Logged out successfully" });
});

export default router;

