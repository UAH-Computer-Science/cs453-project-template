import { InternalServerError, NotFoundError } from '../errors';
import { pool } from "../db/pool";

export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: number;
    role: string;
    createdAt: string;
}

export class UserService {
    static async getAllUsers(): Promise<User[]> {
       try {
            const result = await pool.query(
                `SELECT id,
                name,
                email,
                role,
                created_at AS "createdAt"
            FROM users
            ORDER BY id `,
            );

            return result.rows;
        } catch (error) {
            throw new InternalServerError("Failed to fetch projects.");
        }
    }

    static async getUserByID(requestedID: number): Promise<User> {
        try {
            const result = await pool.query(
                `SELECT id,
                name,
                email,
                role,
                created_at AS "createdAt"
            FROM users
            WHERE id = $1`,
            [requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Task not found.")
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new InternalServerError("Failed to fetch task.")
        }
    }
}