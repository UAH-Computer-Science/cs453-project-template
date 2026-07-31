import { NotFoundError, BadRequestError, InternalServerError, UnauthorizedError } from '../errors';
import { pool } from "../db/pool";

export interface Project {
    id: number;
    name: string;
    description: string;
    ownerID: number;
    createdAt: string;
}

export class ProjectService {
    static async getAllProjects(): Promise<Project[]> {
       try {
            const result = await pool.query(
                `SELECT id,
                name,
                description,
                owner_id AS "ownerID",
                created_at AS "createdAt"
            FROM projects
            ORDER BY id `,
            );

            return result.rows;
        } catch (error) {
            throw new InternalServerError("Failed to fetch projects.");
        }
    }

    static async getProjectByID(requestedID: number): Promise<Project> {
        try {
            const result = await pool.query(
                `SELECT id,
                name,
                description,
                owner_id AS "ownerID",
                created_at AS "createdAt"
            FROM projects
            WHERE id = $1`,
            [requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Project not found.")
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new InternalServerError("Failed to fetch project.")
        }
    }

    static async createProject(name: string, description: string, ownerID: number): Promise<Project> {
        if (!name || !description) {
            throw new BadRequestError("A name and description are required.");
        }
        try {
            // validation that the ownerID is a valid ID in the database
            // if (ownerID) {
            //     const userResult = await pool.query(
            //         `SELECT id 
            //         FROM users
            //         WHERE id = $1`,
            //         [ownerID]
            //     );

            //     if (userResult.rows.length === 0) {
            //         throw new BadRequestError("Invalid user ID.");
            //     }
            // }

            const result = await pool.query(
                `INSERT INTO projects (name, description, owner_id)
                VALUES ($1, $2, $3)
                RETURNING id, name, description, owner_id, created_at`,
                [name, description, ownerID]
            )

            return result.rows[0];
        } catch (error) {
            throw new InternalServerError("Failed to add project.");
        }
    }
}