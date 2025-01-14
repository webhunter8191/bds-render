import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      isAdmin: boolean;
    }
  }
}

// const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.cookies["auth_token"];
//   if (!token) {
//     return res
//       .status(403)
//       .json({ message: "Access Denied , No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET_KEY as string
//     ) as JwtPayload;
//     req.userId = decoded.userId;
//     req.isAdmin = decoded.isAdmin !== undefined ? decoded.isAdmin : false;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "invalid token" });
//   }
// };




// const verifyToken = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.cookies["auth_token"];
//   if (!token) {
//     console.error("No token provided in cookies");
//     return res.status(403).json({ message: "Access Denied, No token provided" });
//   }

//   console.log("Received Token:", token);

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET_KEY as string
//     ) as JwtPayload;
//     console.log("Decoded Token:", decoded);

//     req.userId = decoded.userId;
//     req.isAdmin = decoded.isAdmin !== undefined ? decoded.isAdmin : false;
//     next();
//   } catch (error) {
//     // console.error("Token verification failed:", error.message);
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// export default verifyToken;



const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["auth_token"];
  if (!token) {
    console.error("No token provided in cookies");
    return res.status(403).json({ message: "Access Denied, No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as JwtPayload;

    if (!decoded || !decoded.userId) {
      console.error("Invalid token payload");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin || false;
    next();
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyToken;
