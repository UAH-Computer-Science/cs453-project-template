import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({
      error: "Authentication required",
      message: "The access token is missing, invalid, or expired."
    });
  }
}