import { NotFoundError, BadRequestError, InternalServerError, UnauthorizedError } from '../errors';
import { pool } from "../db/pool";

export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    project_id: number;
    assigned_to: number;
    created_at: string;
    updated_at: string;
}

export class TaskService {
    static async getAllTasks(): Promise<Task[]> {
       try {
            const result = await pool.query(
                `SELECT id,
                title,
                description,
                status,
                project_id AS "projectID",
                assigned_to AS "assignedTo",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            FROM tasks
            ORDER BY id `,
            );

            return result.rows;
        } catch (error) {
            throw new InternalServerError("Failed to fetch tasks.");
        }
    }

    static async getTaskByID(requestedID: number): Promise<Task> {
        try {
            const result = await pool.query(
                `SELECT id,
                title,
                description,
                status,
                project_id AS "projectID",
                assigned_to AS "assignedTo",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            FROM tasks
            WHERE id = $1`,
            [requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Task not found.")
            }

            return result.rows[0];
        } catch (error) {
            throw new InternalServerError("Failed to fetch task.")
        }
    }

    static async createTask(title: string, description: string, status: string, projectID: number, assignedTo: number): Promise<Task> {
        if (!title || !status) {
            throw new BadRequestError("A title and status are required.");
        }
        try {
            // validation that the projectID is a valid ID in the database
            if (projectID) {
                const projectResult = await pool.query(
                    `SELECT id 
                    FROM projects
                    WHERE id = $1`,
                    [projectID]
                );

                if (projectResult.rows.length === 0) {
                    throw new BadRequestError("Invalid project ID.");
                }
            }
            // validation that the user ID the task is assigned to is a valid ID in the database
            if (assignedTo) {
                const assignedResult = await pool.query(
                    `SELECT id 
                    FROM users
                    WHERE id = $1`,
                    [assignedTo]
                );

                if (assignedResult.rows.length === 0) {
                    throw new BadRequestError("Invalid user ID.");
                }
            }

            const result = await pool.query(
                `INSERT INTO tasks (title, description, status, project_id, assigned_to)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
                [title, description, status, projectID, assignedTo]
            )

            return result.rows[0];
        } catch (error) {
            throw new InternalServerError("Failed to add item.");
        }
    }

    static async updateTaskTitle(title: string, requestedID: number): Promise<Task> {
        try {
            const result = await pool.query(
                `UPDATE tasks
                SET title = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
                [title, requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Task not found.");
            }
            return result.rows[0];
        } catch (error) {
            throw new InternalServerError("Failed to update task.");
        }
    }

    static async updateTaskDescription(description: string, requestedID: number): Promise<Task> {
        try {
            const result = await pool.query(
                `UPDATE tasks
                SET description = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
                [description, requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Task not found.");
            }
            return result.rows[0];
        } catch (error) {
            throw new InternalServerError("Failed to update task.");
        }
    }

    static async updateTaskStatus(status: string, requestedID: number): Promise<Task> {
        try {
            const result = await pool.query(
                `UPDATE tasks
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
                [status, requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Task not found.");
            }
            return result.rows[0];
        } catch (error) {
            throw new InternalServerError("Failed to update task.");
        }
    }

    static async updateTaskProjectID(projectID: string, requestedID: number): Promise<Task> {
        try {
            // validation that the projectID is a valid ID in the database
            const projectResult = await pool.query(
                `SELECT id 
                FROM projects
                WHERE id = $1`,
                [projectID]
            );
            if (projectResult.rows.length === 0) {
                throw new BadRequestError("Invalid project ID.");
            }

            const result = await pool.query(
                `UPDATE tasks
                SET project_id = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
                [projectID, requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Task not found.");
            }
            return result.rows[0];
        } catch (error) {
            throw new InternalServerError("Failed to update task.");
        }
    }

    static async updateTaskUserID(assignedTo: string, requestedID: number): Promise<Task> {
        try {
           // validation that the user ID the task is assigned to is a valid ID in the database
            const assignedResult = await pool.query(
                `SELECT id 
                FROM users
                WHERE id = $1`,
                [assignedTo]
            );

            if (assignedResult.rows.length === 0) {
                throw new BadRequestError("Invalid user ID.");
            }

            const result = await pool.query(
                `UPDATE tasks
                SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
                [assignedTo, requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Task not found.");
            }
            return result.rows[0];
        } catch (error) {
            throw new InternalServerError("Failed to update task.");
        }
    }

    static async deleteTask(requestedID: number) {
        try {
            const result = await pool.query(
            `DELETE FROM tasks
            WHERE id = $1`,
            [requestedID]
            );

            if (result.rows.length === 0) {
                throw new NotFoundError("Task not found.");
            }
        } catch (error) {
            throw new InternalServerError("Failed to delete item.");
        }
    }
}