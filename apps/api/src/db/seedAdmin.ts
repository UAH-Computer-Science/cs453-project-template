import bcrypt from "bcryptjs";
import { pool } from "./pool";
import { InternalServerError } from "../errors";

async function seedAdmin() {
    const name = process.env.ADMIN_NAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@uah.edu';
    const password = process.env.ADMIN_PASSWORD || 'admin-password';

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, 'admin')
            ON CONFLICT (email) DO NOTHING
            RETURNING id, name, email, role, created_at`,
            [name, email, passwordHash]
        )
        if (result.rows.length > 0) {
            console.log('Admin created successfully: ', result.rows[0]);
        } else {
            console.log('Admin user with email "${email} already exists.');
        }
    } catch (error) {
        throw new InternalServerError("Failed to create admin user.");
    } finally {
        await pool.end();
    }
}

seedAdmin().catch((error) => {
    console.error("Execution error: ", error);
});