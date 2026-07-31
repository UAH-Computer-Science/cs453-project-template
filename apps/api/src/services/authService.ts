import { NotFoundError, BadRequestError, InternalServerError, UnauthorizedError } from '../errors';
import { pool } from "../db/pool";
import bcrypt from "bcryptjs";

export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    created_at: string;
}

export class AuthService {
    static async registerUser(name: string, email: string, passwordHash: string): Promise<User> {
        if (!name || !email || !passwordHash) {
            throw new BadRequestError ("A name, email, and password are required.");
        }

        try {
            const result = await pool.query(
                `INSERT INTO users (name, email, password_hash)
                VALUES ($1, $2, $3)
                RETURNING id, name, role, created_at`,
                [name, email, passwordHash]
            );
            return result.rows[0];
        } catch {
            throw new InternalServerError("Failed to register user.");
        }
    }

    static async login(username: string, password: string): Promise<User> {
        if (!username || !password) {
            throw new BadRequestError("Username and password are required.");
        }

        try {
            const result = await pool.query(
                "SELECT id, name, password_hash, role FROM users WHERE name = $1",
                [username]
            );
            const user = result.rows[0];
            
            // Use the same response for an unknown username and a wrong password.
            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                throw new UnauthorizedError("Invalid username or password.");
            }
            return user;
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                throw error;
            }
            throw new InternalServerError("Failed to login.");
        }
    }
}