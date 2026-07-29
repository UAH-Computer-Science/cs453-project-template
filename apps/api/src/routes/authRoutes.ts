import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from "../services/authService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { InternalServerError } from '../errors';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
}
const jwtExpiresIn = "1h";

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
   try {
    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim();
    const passwordHash = await bcrypt.hash(req.body?.password?.trim(), 10);

    const registeredUser = await AuthService.registerUser(name, email, passwordHash);
    res.status(201).json(registeredUser);
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const username = req.body?.username?.trim();
        const password = req.body?.password;

        const user = await AuthService.login(username, password);

        try {
            const token = jwt.sign(
                { sub: String(user.id), username: user.name, role: user.role },
                jwtSecret,
                { expiresIn: jwtExpiresIn }
            );
        
            res.json({
                accessToken: token,
                tokenType: "Bearer",
                expiresIn: jwtExpiresIn,
                user: { id: user.id, username: user.name, role: user.role }
            });
        } catch (error) {
            throw new InternalServerError("Login failed.");
        }
    } catch (error) {
        next(error);
    }
});


export default router;