import express, { Request, Response, NextFunction } from "express";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `This action requires one of these roles: ${roles.join(", ")}.`
      });
    }

    next();
  };
}