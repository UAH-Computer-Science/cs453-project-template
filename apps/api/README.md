# Checkpoint 1: Core API Structure

This checkpoint covers:  
Milestone 1 — Basic Task API  
Milestone 2 — Full Task CRUD  
Milestone 3 — Database Integration  

## How to install dependencies  
```bash
cd cs453-project-template/apps/api
npm install
```

## How to configure the database connection  
With docker running on your machine:
```bash
docker-compose up -d
```

## How to create the database tables  
The server does this automatically through the function ```initializeDatabase()```. There are no special steps for the user to take.  

## How to start the server  
```bash
npm run dev
```
The server runs on ```http://localhost:3000```.   

## How to run tests  
In a different terminal also pointing to ```cs453-project-template/apps/api```
```bash
npm test
```

## What routes your API supports  

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/db-health` | Check database connection status |
| GET | `/tasks` | Return all tasks |
| GET | `/tasks/:id` | Return an existing task |
| POST | `/tasks` | Create a new task |
| PATCH | `/tasks/:id` | Update an existing task  |
| DELETE | `/tasks/:id` | Delete an existing task  |

## Reflection Questions

**1. What is the difference between an in-memory API and a database-backed API?**  
A database-backed API is persistent. When the server session is concluded, the state of the data is saved in the database so that if another server session is started, a user can continue to work on the data. An in-memory API will reset each time the program is run, meaning it is not persistent. 
Real-world applications will always be database-backed, as there is no point in making changes if they are not integrated to become part of the system. It is also crucial to have a database in the case of a crash or other server fail. Whatever work the user completed before the crash will be saved 
in the database and the state can be restored upon server restart.  

**2. Why is it useful to separate routes, services, and database logic?**  
This aligns with the computer science principle the Separation of Concerns. Separating each segment of the application is best practice as it makes future updates and changes much easier to make. Software Engineering is a cyclical process, and the lifecycle does not stop after the first release. 
Applications are constantly being changed or updated and separating the logic allows for much easier maintenance. It also makes the application more scalable, and allows for easier testing as well.  

**3. What HTTP status codes did you use, and why?**  
200: OK  
201: Item created  
204: Successful deletion  
400: Bad Request (information they entered was incorrect)  
404: Not found (the request they entered was not a valid route)  
500: Database connection failed  
These are standard HTTP status codes that are universally understood to mean what I used them for.  
I used 200 for GET /tasks, GET /tasks/:id, and PATCH /tasks/:id.  
I used 201 for POST /tasks.  
I used 204 for DELETE /tasks/:id.  
I used 400 for POST and PATCH requests if the data the user entered was insufficient.  
I used 404 for if the ID that was entered was an invalid ID or if the route was incorrect.  
I used 500 for any request that the database failed for.  

**4. What happens when a client requests a task ID that does not exist?**  
The client will send a fetch GET/http://localhost:3000/api/tasks/id. This tells the server to run the get() function. Using id = what the user input, the server runs an SQL query "SELECT * FROM tasks WHERE id = $1", [requestedID] which means we will select all columns from the tasks table where the ID matches
the one the user entered. We then return the row[s] that correspond with the requested ID. If the ID does not exist, the function will return 0 rows. The client will try to display the rows, but there will be nothing to display. The client then, correctly, displays nothing for a task ID that does not exist. 
CHECK AND SEE WHAT HAPPENS, WHAT CODE IS RETURNED, ETC.  

**5. What was the hardest part of connecting the API to PostgreSQL?**  
I ran into an issue with the keywords "description" and "status" in schema.sql. They were showing up as red text in my IDE, and I thought SQL was reading them in as special keywords. I changed them to "description1" and "status1", but ended up changing them back once I realized they were being read correctly. 

## Notes  
I did not end up moving my logic out of the main server file. I was already having some issues with the file structure, and I did not feel I had the time or resources to complete this successfully. If we have an example of separation of concerns in class that shows what logic should go where, I will feel confident enough to separate my server.ts file for the subsequent checkpoints. For now, all the server logic is in ```cs453-project-template/apps/api/src/server.ts```.   

# Checkpoint 2: Data Model, Authentication, Authorization

This checkpoint covers:  
Milestone 4 — Expand the Data Model
Milestone 5 — Authentication
Milestone 6 — Authorization and Ownership

How to configure the JWT secret.

How to create or update the database tables.

How to create an administrator account.

How to register and log in.

How to send a JWT with a request.

What user, project, and task routes are available.

Which routes or operations require the admin role.

What ownership or authorization rules your application enforces.


## Reflection Questions

**1. What is the difference between authentication and authorization?**  


**2. Why should passwords be hashed instead of stored directly?**  


**3. What information did you include in your JWT, and why?**  


**4. What is the difference between a 401 response and a 403 response?**  


**5. Where does your application perform role or ownership checks?**  


**6. How are users, projects, and tasks related in your database?**  


**7. What was the hardest part of adding authentication or authorization?**  

# Test Plan

## Example curl commands  

GET /health:  
```bash
curl http://localhost:3000/health
```
Output:  
```{"status":"ok", "service":"cs453-api"}```
<br><br><br>

GET /db-health:  
```bash
curl http://localhost:3000/db-health
```
Output:  
```{"status":"ok","database":"connected","currentTime":"2026-07-14T23:21:33.897Z"}```
<br><br><br>

Attempt a protected route without being logged in (GET /tasks):  
```bash
curl http://localhost:3000/tasks
```
Output:  
```{"error":"Unauthorized","message":"Send a Bearer token in the Authorization header."}```
<br><br><br>

Attempt a login without registering first (POST /auth/login):
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "user-password"}'
```
Output:  
```{"error":"Invalid username or password."}```
<br><br><br>

Register a user (POST /auth/login):
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "user", "email": "useremail@uah.edu", "password": "user-password"}'
```
Output:  
```{"id":1,"name":"user","role":"user","created_at":"2026-07-31T04:12:59.999Z"}```
<br><br><br>

Attempt a login with missing information (POST /auth/login):
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "", "password": "user-password"}'
```
Output:  
```{"error":"Username and password are required."}```
<br><br><br>

Login (POST /auth/login):
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "user-password"}'
```
Output:  
```{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ","tokenType":"Bearer","expiresIn":"1h","user":{"id":1,"username":"user","role":"user"}}```
<br><br><br>

Attempt to create a project with missing information (POST /projects):
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ" \
  -d '{"name": "", "description": "Final project for CS553"}'
```
Output:  
```{"error":"A name and description are required."}```
<br><br><br>

Create a project (POST /projects):
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ" \
  -d '{"name": "Final", "description": "Final exam for CS553"}'
```
Output:  
```{"id":2,"name":"Final","description":"Final exam for CS553","ownerID":1,"createdAt":"2026-07-31T04:45:13.366Z"}```
<br><br><br>

Fetch all projects (GET /projects):
```bash
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ"
```
Output:  
```[{"id":1,"name":"Checkpoint 2","description":"Final project for CS553","ownerID":1,"createdAt":"2026-07-31T04:39:58.778Z"},{"id":2,"name":"Final","description":"Final exam for CS553","ownerID":1,"createdAt":"2026-07-31T04:45:13.366Z"}]```
<br><br><br>

Fetch a project by its ID with an invalid ID (GET /projects/:id):
```bash
curl -X GET http://localhost:3000/projects/10 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ"
```
Output:  
```{"error":"Project not found."}```
<br><br><br>

Fetch a project by its ID (GET /projects/:id):
```bash
curl -X GET http://localhost:3000/projects/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ"
```
Output:  
```{"id":1,"name":"Checkpoint 2","description":"Final project for CS553","ownerID":1,"createdAt":"2026-07-31T04:39:58.778Z"}```
<br><br><br>

Attempt to create a task with missing data (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"title": "", "description": "Enter curl commands and outputs into README.md", "status": "todo", "project_id": "1", "assigned_to": "1"}'
```
Output:  
```{"error":"A title and status are required."}```
<br><br><br>

Attempt to create a task with invalid project ID (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"title": "Create test plan", "description": "Enter curl commands and outputs into README.md", "status": "todo", "project_id": "10", "assigned_to": "1"}'
```
Output:  
```{"error":"Invalid project ID."}```
<br><br><br>

Attempt to create a task with invalid user ID (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"title": "Create test plan", "description": "Enter curl commands and outputs into README.md", "status": "todo", "project_id": "1", "assigned_to": "10"}'
```
Output:  
```{"error":"Invalid user ID."}```
<br><br><br>

Create a task and associate it with a project (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ" \
  -d '{"title": "Create test plan", "description": "Enter curl commands and outputs into README.md", "status": "todo", "project_id": "1", "assigned_to": "1"}'
```
Output:  
```{"id":1,"title":"Create test plan","description":"Enter curl commands and outputs into README.md","status":"todo","project_id":1,"assigned_to":1,"created_at":"2026-07-31T04:50:53.645Z","updated_at":"2026-07-31T04:50:53.645Z"}```
<br><br><br>

Create another task and associate it with a project (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"title": "Answer reflection questions", "description": "Enter answers to reflection questions into README.md", "status": "todo", "project_id": "1", "assigned_to": "1"}'
```
Output:  
```{"id":2,"title":"Answer reflection questions","description":"Enter answers to reflection questions into README.md","status":"todo","project_id":1,"assigned_to":1,"created_at":"2026-07-31T04:53:44.248Z","updated_at":"2026-07-31T04:53:44.248Z"}```
<br><br><br>

Fetch all tasks (GET /tasks):  
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ"
```
Output:  
```[{"id":1,"title":"Create test plan","description":"Enter curl commands and outputs into README.md","status":"todo","projectID":1,"assignedTo":1,"createdAt":"2026-07-31T04:50:53.645Z","updatedAt":"2026-07-31T04:50:53.645Z"},{"id":2,"title":"Answer reflection questions","description":"Enter answers to reflection questions into README.md","status":"todo","projectID":1,"assignedTo":1,"createdAt":"2026-07-31T04:53:44.248Z","updatedAt":"2026-07-31T04:53:44.248Z"}]```
<br><br><br>

Fetch a specific task by ID with invalid ID (GET /tasks/:id):  
```bash
curl -X GET http://localhost:3000/tasks/10 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM"
```
Output:  
```{"error":"Task not found."}```
<br><br><br>

Fetch a specific task by ID (GET /tasks/:id):  
```bash
curl -X GET http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ"
```
Output:  
```{"id":1,"title":"Create test plan","description":"Enter curl commands and outputs into README.md","status":"todo","projectID":1,"assignedTo":1,"createdAt":"2026-07-31T04:50:53.645Z","updatedAt":"2026-07-31T04:50:53.645Z"}```
<br><br><br>

Attempt to update a task with a blank field (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"status": ""}'
```
Output:  
```{"error":"A status is required."}```
<br><br><br>

Attempt to update a task with an invalid project ID (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"project_id": "10"}'
```
Output:  
```{"error":"Invalid project ID."}```
<br><br><br>

Attempt to update a task with an invalid user ID (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"assigned_to": "10"}'
```
Output:  
```{"error":"Invalid user ID."}```
<br><br><br>

Attempt to update a task that does not exist (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"status": "done"}'
```
Output:  
```{"error":"Task not found."}```
<br><br><br>

Update a task (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM" \
  -d '{"status": "done"}'
```
Output:  
```{"id":2,"title":"Answer reflection questions","description":"Enter answers to reflection questions into README.md","status":"done","project_id":1,"assigned_to":1,"created_at":"2026-07-31T04:53:44.248Z","updated_at":"2026-07-31T05:37:27.392Z"}```
<br><br><br>

## CAN ADD OTHER PATCH TESTS HERE

Delete a task with an invalid ID (DELETE /tasks/:id):  
```bash
curl -X DELETE http://localhost:3000/tasks/10 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM"
```
Output:  
```{"error":"Task not found."}```
<br><br><br>

Delete a task (DELETE /tasks/:id):  
```bash
curl -X DELETE http://localhost:3000/tasks/2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM"
```
Output:  

<br><br><br>

Check that the task was deleted (GET /tasks):
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzY1MTcsImV4cCI6MTc4NTQ4MDExN30.A9RzJH9nWJXUJFf2VlbByibXxeG_1aw3IXVlR3sR0qM"
```
Output:  
```[{"id":1,"title":"Create test plan","description":"Enter curl commands and outputs into README.md","status":"todo","projectID":3,"assignedTo":1,"createdAt":"2026-07-31T04:50:53.645Z","updatedAt":"2026-07-31T04:50:53.645Z"}]```
<br><br><br>