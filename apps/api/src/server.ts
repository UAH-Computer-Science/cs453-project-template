import express, { Request, Response, NextFunction } from "express";
import { env } from "./config/env";
import { pool } from "./db/pool";
import * as fs from 'fs';
import * as path from 'path';

import { AppError } from './errors';

import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import projectRoutes from "./routes/projectRoutes";
import userRoutes from "./routes/userRoutes";

export const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use("/users", userRoutes);

app.get("/health", (_req, res) => {
	res.json({
		status: "ok",
		service: "cs453-api",
	});
});

app.get("/db-health", async (_req, res) => {
	try {
		const result = await pool.query("SELECT NOW() AS current_time");
		res.json({
			status: "ok",
			database: "connected",
			currentTime: result.rows[0].current_time,
		});
	} catch (error) {
		console.error("Database health check failed:", error);
		res.status(500).json({
			status: "error",
			database: "disconnected",
		});
	}
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

async function initializeDatabase() {
  try {
    // await pool.query(`DROP TABLE users CASCADE`);
    const filePath = path.join('../../database', 'schema.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
  } catch (error) {
    console.error("Error initializing database: ", error);
  }
}

initializeDatabase()
  .then(() => {
    app.listen(env.port, () => {
	    console.log(`Server running at http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed: ", error);
    process.exit(1);
  });


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Unhandled/Unexpected errors (e.g. Database connection failure) -> default to 500
  console.error('Unhandled Error:', err);
  return res.status(500).json({
    error: 'Internal Server Error',
  });
});


// app.listen(env.port, () => {
//   console.log(`Server running at http://localhost:${env.port}`);
// });

