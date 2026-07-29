import express, { Request, Response, NextFunction } from "express";
import { env } from "./config/env";
import { pool } from "./db/pool";
import * as fs from 'fs';
import * as path from 'path';
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

import { AppError } from './errors';

import { authenticateToken } from "./middleware/authentication";
import { requireRole } from "./middleware/authorize";

import authRoutes from "./routes/authRoutes";

export const app = express();

// const jwtSecret = process.env.JWT_SECRET;
// if (!jwtSecret) {
//   throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
// }
// const jwtExpiresIn = "1h";

app.use(express.json());

app.use("/auth", authRoutes);

// app.post("/auth/register", async (_req, res) => {
//   const name = _req.body?.name?.trim();
//   const email = _req.body?.email?.trim();
//   const passwordHash = await bcrypt.hash(_req.body?.password?.trim(), 10);

//   if (!name || !email || !passwordHash) {
//     return res.status(400).json({
//       error: "Bad Request",
//       message: "A name, email, and password are required."
//     });
//   }

//   try {
//     const result = await pool.query(
//       `INSERT INTO users (name, email, password_hash)
//       VALUES ($1, $2, $3)
//       RETURNING id, name, role, created_at`,
//       [name, email, passwordHash]
//     )
//     res.status(201).json({ task: result.rows[0] });
//   } catch (error) {
//     console.error("Failed to add item: ", error);
//     res.status(500).json({
//       error: "Internal Server Error",
//       message: "Failed to add item."
//     });
//   }
// });

// app.post("/auth/login", async (_req, res) => {
//   const username = _req.body?.username?.trim();
//   const password = _req.body?.password;

//   if (!username || !password) {
//     return res.status(400).json({
//       error: "Bad Request",
//       message: "Username and password are required."
//     });
//   }

//   try {
//     const result = await pool.query(
//       "SELECT id, username, password_hash, role FROM users WHERE username = $1",
//       [username]
//     );
//     const user = result.rows[0];

//     // Use the same response for an unknown username and a wrong password.
//     if (!user || !(await bcrypt.compare(password, user.password_hash))) {
//       return res.status(401).json({
//         error: "Unauthorized",
//         message: "Invalid username or password."
//       });
//     }

//     const token = jwt.sign(
//       { sub: String(user.id), username: user.username, role: user.role },
//       jwtSecret,
//       { expiresIn: jwtExpiresIn }
//     );

//     res.json({
//       accessToken: token,
//       tokenType: "Bearer",
//       expiresIn: jwtExpiresIn,
//       user: { id: user.id, username: user.username, role: user.role }
//     });
//   } catch (error) {
//     console.error("Login failed:", error);
//     res.status(500).json({ error: "Internal Server Error", message: "Login failed." });
//   }
// });

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

app.get("/tasks", authenticateToken, async (_req, res) => {
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

		res.status(200).json(result.rows);
	} catch (error) {
		console.error("Failed to fetch tasks:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to fetch tasks",
		});
	}
});

app.get("/tasks/:id", authenticateToken, async (_req, res) => {
  const requestedID = Number(_req.params.id);
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
      return res.status(404).json({ error: "Task not found" });
    }

		res.status(200).json( result.rows[0] );
	} catch (error) {
		console.error("Failed to fetch tasks:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to fetch tasks",
		});
	}
});

app.post("/tasks", authenticateToken, async (_req, res) => {
  const title = _req.body?.title?.trim();
  const description = _req.body?.description?.trim();
  const status = _req.body?.status?.trim();
  const projectID = _req.body?.project_id?.trim();
  const assignedTo = _req.body?.assigned_to?.trim();

  if (!title || !status) {
    return res.status(400).json({
      error: "Bad Request",
      message: "A title and status are required."
    });
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
        return res.status(400).json({
          error: "Invalid project ID",
          message: "Invalid project ID."
        });
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
        return res.status(400).json({
          error: "Invalid user ID",
          message: "Invalid user ID."
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, project_id, assigned_to)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
      [title, description, status, projectID, assignedTo]
    )
    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Failed to add item: ", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to add item."
    });
  }
});

app.patch("/tasks/:id", authenticateToken, async (_req, res) => {
  const requestedID = Number(_req.params.id);

  if ("title" in _req.body) {
    const title = _req.body?.title?.trim();
    if (!title) {
      return res.status(400).json({
        error: "Bad Request",
        message: "A title is required."
      });
    }
    try {
      const result = await pool.query(
        `UPDATE tasks
        SET title = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
        [title, requestedID]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json({ task: result.rows[0] });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  } else if ("description" in _req.body) {
    const description = _req.body?.description?.trim();
    if (!description) {
      return res.status(400).json({
        error: "Bad Request",
        message: "A description is required."
      });
    }
    try {
      const result = await pool.query(
        `UPDATE tasks
        SET description = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
        [description, requestedID]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json({ task: result.rows[0] });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  } else if ("status" in _req.body) {
    const status = _req.body?.status?.trim();
    if (!status) {
      return res.status(400).json({
        error: "Bad Request",
        message: "A status is required."
      });
    }
    try {
      const result = await pool.query(
        `UPDATE tasks
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
        [status, requestedID]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json({ task: result.rows[0] });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  } else if ("project_id" in _req.body) {
    const projectID = _req.body?.project_id?.trim();
    if (!projectID) {
      return res.status(400).json({
        error: "Bad Request",
        message: "A project ID is required."
      });
    }
    try {
      // validation that the projectID is a valid ID in the database
      const projectResult = await pool.query(
        `SELECT id 
        FROM projects
        WHERE id = $1`,
        [projectID]
      );

      if (projectResult.rows.length === 0) {
        return res.status(400).json({
          error: "Invalid project ID",
          message: "Invalid project ID."
        });
      }

      const result = await pool.query(
        `UPDATE tasks
        SET project_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
        [projectID, requestedID]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json({ task: result.rows[0] });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  } else if ("assigned_to" in _req.body) {
    const assignedTo = _req.body?.assigned_to?.trim();
    if (!assignedTo) {
      return res.status(400).json({
        error: "Bad Request",
        message: "A user ID assigned to this task is required."
      });
    }
    try {
      // validation that the user ID the task is assigned to is a valid ID in the database
      const assignedResult = await pool.query(
        `SELECT id 
        FROM users
        WHERE id = $1`,
        [assignedTo]
      );

      if (assignedResult.rows.length === 0) {
        return res.status(400).json({
          error: "Invalid user ID",
          message: "Invalid user ID."
        });
      }

      const result = await pool.query(
        `UPDATE tasks
        SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, title, description, status, project_id, assigned_to, created_at, updated_at`,
        [assignedTo, requestedID]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.status(200).json({ task: result.rows[0] });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  }
});

app.delete("/tasks/:id", authenticateToken, async (_req, res) => {
  const requestedID = Number(_req.params.id);
  try {
    const result = await pool.query(
      `DELETE FROM tasks
      WHERE id = $1`,
      [requestedID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).json({ status: "Successfully deleted" });
  } catch (error) {
    console.error("Failed to load items:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to load items."
    });
  }
});

app.get("/projects", authenticateToken, async (_req, res) => {
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

		res.status(200).json(result.rows);
	} catch (error) {
		console.error("Failed to fetch projects:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to fetch projects",
		});
	}
});

app.get("/projects/:id", authenticateToken, async (_req, res) => {
  const requestedID = Number(_req.params.id);
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
      return res.status(404).json({ error: "Project not found" });
    }

		res.status(200).json( result.rows[0] );
	} catch (error) {
		console.error("Failed to fetch projects:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to fetch projects",
		});
	}
});

app.post("/projects", authenticateToken, async (_req, res) => {
  const name = _req.body?.name?.trim();
  const description = _req.body?.description?.trim();
  const ownerID = _req.body?.owner_id?.trim();

  if (!name || !description) {
    return res.status(400).json({
      error: "Bad Request",
      message: "A name and description are required."
    });
  }

  try {
    // validation that the ownerID is a valid ID in the database
    if (ownerID) {
      const userResult = await pool.query(
        `SELECT id 
        FROM users
        WHERE id = $1`,
        [ownerID]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({
          error: "Invalid user ID",
          message: "Invalid user ID."
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, owner_id, created_at`,
      [name, description, ownerID]
    )
    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Failed to add project: ", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to add project."
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

async function initializeDatabase() {
  try {
    await pool.query(`DROP TABLE tasks`);
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
    // Custom domain error (400, 404, 409, etc.)
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

