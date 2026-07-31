import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserService } from "../services/userService";
import { InternalServerError } from "../errors";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  }
  
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Send a Bearer token in the Authorization header."
    });
  }

  const token = authorization.slice("Bearer ".length);

  try {
    // req.user = jwt.verify(token, jwtSecret);
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      id: Number(decoded.id ?? decoded.sub),
      name: decoded.name,
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({
      error: "Authentication required",
      message: "The access token is missing, invalid, or expired."
    });
  }
}

export const canModify = async (userID: number, resourceOwnerID: number): Promise<boolean> => {
  try {
    const user = await UserService.getUserByID(userID);
    if (user.role === 'admin') {
      return true;
    }
    return user.id === resourceOwnerID;
  } catch(error) {
    throw new InternalServerError("Could not authenticate user permissions.");
  }
  
}