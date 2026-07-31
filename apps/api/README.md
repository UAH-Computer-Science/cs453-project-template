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
If vitest is installed, you can run the tests that cover Checkpoint 1.  
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

## How to configure the JWT secret.  
The JWT secret is configured in your .env file, which should live in the top folder of the project ```cs453-project-template```. I have included a .env.example file to show what should generally be in the .env file. The .env.example file has:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cs453
PORT=3000
JWT_SECRET=replace-this-value
```
When creating your .env file, you should replace the JWT_SECRET value "replace-this-value" with your own long, random string. This is for security purposes. A long, random string cannot be guessed easily by a malicious script trying to crack the secret value.  

## How to create or update the database tables.  
The user should run
```bash
docker compose down -v
```
in the ```cs453-project-template``` folder (the directory containing the ```docker-compose.yml``` file) before running the server as this completely resets the database. The database needed to be reset for Milestone 4 as more tables were added to the database and the ```tasks``` table was updated.
After this command has been run, run 
```bash
docker compose up -d
```
to restart the database, and 
```bash
npm run dev
```
to start the server after, which automatically runs the ```schema.sql``` script to create the tables.

## How to create an administrator account.  
The ```schema.sql``` script automatically creates an admin account for use in testing. The username is "admin" and the password is "admin-password".  

## How to register and log in.  
Once the server is running, the user can use CURL commands to register and login. The route for registering is POST /auth/register, and the route for logging in is POST /auth/login. Registration requires a username, email, and password passed in as a JSON object, and logging in requires a registered username and password passed in as a JSON object. Example CURL commands are below:  
Registration:  
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "user", "email": "useremail@uah.edu", "password": "user-password"}'
```
Logging in:  
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "user-password"}'
```
After the user logs in, the application will send a Bearer token, which will allow the user to access the application.  

## How to send a JWT with a request.  
Once you login and receive the Bearer token, you will use that for most of the remaining routes. The bearer is passed in the request with the -H modifier. Here is an example of a GET /tasks request using the bearer token:
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
A POST or PATCH request requires more information, including another line with a -H modifier. Here is an example of a POST /projects request using the bearer token:
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name": "Final", "description": "Final exam for CS553"}'
```
The user should replace ```YOUR_TOKEN_HERE``` with their JWT token they received upon logging in.  

## What user, project, and task routes are available.  
| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/db-health` | Check database connection status |
| GET | `/tasks` | *Return all tasks |
| GET | `/tasks/:id` | *Return an existing task |
| POST | `/tasks` | *Create a new task |
| PATCH | `/tasks/:id` | *Update an existing task  |
| DELETE | `/tasks/:id` | *Delete an existing task  |
| GET | `/projects` | *Return all projects |
| GET | `/projects/:id` | *Return an existing project |
| POST | `/projects` | *Create a new project |
| GET | `/users` | *Return all users (ADMIN ONLY) |

*Requires authentication

## Which routes or operations require the admin role.  
The only implemented route that requires the admin role is GET /users. Normal users aren't allowed to access the list of users. Admins, however, can modify and delete tasks that they don't own, a privilege that regular users do not have.

## What ownership or authorization rules your application enforces.  
* A normal user can create projects and tasks freely.
* The user who creates a project becomes its owner.
* A normal user can update or delete resources they own or are allowed to manage (tasks that belong to projects that the user owns).
* A normal user cannot modify or delete another user’s project or protected resources (tasks that belong to projects that a different user owns).
* An administrator may access or modify any project or task.
* Only an administrator may view a list of all users.  


## Reflection Questions

**1. What is the difference between authentication and authorization?**  
In short, authentication proves the identity of the user, while authorization grants the user certain permissions. Authentication answers the question "Who are you?" and accepts login credentials, providing the user with a token to stay logged in throughout the entire session. Authorization answers the question "What can you do?" and grants the user permissions based on the user's role. Authentication must happen first to establish the user's identity, and the authorization decisions depend on the information gained from the user's identity.  

**2. Why should passwords be hashed instead of stored directly?**  
Attackers may try to steal the password database, and having plaintext passwords stored means the attackers can access each user's password. Even if the database becomes compromised, the information stays safe. Storing the password as a hash turns it into a long, random string that cannot be reverse-engineered to access the original password string. This also provides protection from insider threats. Even database engineers or software engineers working on the system cannot view users' passwords.  

**3. What information did you include in your JWT, and why?**  
The JWT header contains the encryption algorithm (HS256) and the type of token (JWT). The payload contains the user ID as "sub", the username, the user's role, the issued at time, and the expiration time. These are items commonly included in the JWT, and are the items that are useful to access throughout the application as the user attempts different routes. Because the JWT is easily decoded, no sensitive user information (such as email or password) is included in the JWT.  

**4. What is the difference between a 401 response and a 403 response?**  
A 401 response means "Unauthorized", while a 403 response returns "Forbidden". In our project, the 401 response is used for issues with authentication, while the 403 response is used for issues with authorization.  
The Unauthorized error is thrown when a user attempts to login with invalid credentials, or when the JWT is not passed in with the request, meaning the system cannot authenticate who is sending the request. The Forbidden error is thrown when a user attempts to perform an operation that is above their role level. If a normal user attempts to view all users, this error will be thrown as viewing user data is a privilege to users whose role is "admin". Likewise, if a user attempts to delete a task that does not belong to them, this error will also be thrown.  

**5. Where does your application perform role or ownership checks?**  
I have authentication and authorization middleware stored in ```cs453-project-template/apps/api/src/middleware```. ```authentication.ts``` has the function ```authenticateToken()``` which is called in every single route. Other than GET /health, GET /health-db, POST /auth/register, and POST /auth/login, there is nothing in our application that can be done without the user being logged in. ```authentication.ts``` also has the function ```canModify()``` which determines if the user is allowed to update or delete an existing resource. It accepts the current user's ID and the ID of the owner of the resource and returns TRUE if these ID's are identical or if the user is an "admin" role, otherwise it returns false. Finally, ```authorize.ts``` holds the function ```requireRole()``` which is used for the routes that only "admin" roles can perform (such as returning all users).  

**6. How are users, projects, and tasks related in your database?**  
First, we have our ```users``` table that holds the fields ID, name, email, password_hash, role, and created_at. We then have our ```projects``` table, which is connected to the ```users``` table through the foreign key owner_id. This represents the ID of the user who created the project. The ```projects``` table also has fields ID, name, description, and created_at. Finally, we have our ```tasks``` table, which holds the fields ID, title, description, status, created_at, and updated_at. It also holds the foreign key project_id, which references the ```project``` table's primary key "id". This represents the project that the task is associated with. The ```tasks``` table also holds the foreign key assigned_to, which references the ```user``` table's primary key "id". This represents a user in the database that is to complete the task.  
Basically, each project has an owner and also has tasks associated with it. Each task is assigned to its project and has a user assigned to complete it.  

**7. What was the hardest part of adding authentication or authorization?**  
The hardest part was figuring out how to configure the JWT so that I could access the user's ID as a number. I had to change the code from class slightly to ensure that req.user had fields id (which was a number), name, and role and that these fields could be accessed throughout the application. This allowed me to check the user's role for authorization of admin-only routes as well as the user's ID to compare to the project owner's ID for authorization of update and delete routes.  

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

Register a user (POST /auth/register):
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "user", "email": "useremail@uah.edu", "password": "user-password"}'
```
Output:  
```{"id":2,"name":"user","role":"user","created_at":"2026-07-31T04:12:59.999Z"}```
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
```{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODU0NzE2NjksImV4cCI6MTc4NTQ3NTI2OX0.3Qb2UEqxcoMuK-qoK8EbnT5_IR-WRJgF17fzswX2hkQ","tokenType":"Bearer","expiresIn":"1h","user":{"id":2,"username":"user","role":"user"}}```
<br><br><br>

Attempt to create a project with missing information (POST /projects):
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"name": "", "description": "Final project for CS553"}'
```
Output:  
```{"error":"A name and description are required."}```
<br><br><br>

Create a project (POST /projects):
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"name": "Checkpoint 2", "description": "Final project for CS553"}'
```
Output:  
```{"id":1,"name":"Checkpoint 2","description":"Final project for CS553","ownerID":2,"createdAt":"2026-07-31T04:39:58.778Z"}```
<br><br><br>

Create another project (POST /projects):
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"name": "Final", "description": "Final exam for CS553"}'
```
Output:  
```{"id":2,"name":"Final","description":"Final exam for CS553","ownerID":2,"createdAt":"2026-07-31T04:45:13.366Z"}```
<br><br><br>

Fetch all projects (GET /projects):
```bash
curl -X GET http://localhost:3000/projects \
  -H "Authorization: Bearer "
```
Output:  
```[{"id":1,"name":"Checkpoint 2","description":"Final project for CS553","ownerID":2,"createdAt":"2026-07-31T04:39:58.778Z"},{"id":2,"name":"Final","description":"Final exam for CS553","ownerID":2,"createdAt":"2026-07-31T04:45:13.366Z"}]```
<br><br><br>

Fetch a project by its ID with an invalid ID (GET /projects/:id):
```bash
curl -X GET http://localhost:3000/projects/10 \
  -H "Authorization: Bearer "
```
Output:  
```{"error":"Project not found."}```
<br><br><br>

Fetch a project by its ID (GET /projects/:id):
```bash
curl -X GET http://localhost:3000/projects/1 \
  -H "Authorization: Bearer "
```
Output:  
```{"id":1,"name":"Checkpoint 2","description":"Final project for CS553","ownerID":2,"createdAt":"2026-07-31T04:39:58.778Z"}```
<br><br><br>

Attempt to create a task with missing data (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"title": "", "description": "Enter curl commands and outputs into README.md", "status": "todo", "project_id": "1", "assigned_to": "2"}'
```
Output:  
```{"error":"A title and status are required."}```
<br><br><br>

Attempt to create a task with invalid project ID (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"title": "Create test plan", "description": "Enter curl commands and outputs into README.md", "status": "todo", "project_id": "10", "assigned_to": "2"}'
```
Output:  
```{"error":"Invalid project ID."}```
<br><br><br>

Attempt to create a task with invalid user ID (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"title": "Create test plan", "description": "Enter curl commands and outputs into README.md", "status": "todo", "project_id": "1", "assigned_to": "10"}'
```
Output:  
```{"error":"Invalid user ID."}```
<br><br><br>

Create a task and associate it with a project (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"title": "Create test plan", "description": "Enter curl commands and outputs into README.md", "status": "todo", "project_id": "1", "assigned_to": "2"}'
```
Output:  
```{"id":1,"title":"Create test plan","description":"Enter curl commands and outputs into README.md","status":"todo","project_id":1,"assigned_to":2,"created_at":"2026-07-31T04:50:53.645Z","updated_at":"2026-07-31T04:50:53.645Z"}```
<br><br><br>

Create another task and associate it with a project (POST /tasks):  
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"title": "Answer reflection questions", "description": "Enter answers to reflection questions into README.md", "status": "todo", "project_id": "1", "assigned_to": "2"}'
```
Output:  
```{"id":2,"title":"Answer reflection questions","description":"Enter answers to reflection questions into README.md","status":"todo","project_id":1,"assigned_to":2,"created_at":"2026-07-31T04:53:44.248Z","updated_at":"2026-07-31T04:53:44.248Z"}```
<br><br><br>

Fetch all tasks (GET /tasks):  
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer "
```
Output:  
```[{"id":1,"title":"Create test plan","description":"Enter curl commands and outputs into README.md","status":"todo","projectID":1,"assignedTo":2,"createdAt":"2026-07-31T04:50:53.645Z","updatedAt":"2026-07-31T04:50:53.645Z"},{"id":2,"title":"Answer reflection questions","description":"Enter answers to reflection questions into README.md","status":"todo","projectID":1,"assignedTo":2,"createdAt":"2026-07-31T04:53:44.248Z","updatedAt":"2026-07-31T04:53:44.248Z"}]```
<br><br><br>

Fetch a specific task by ID with invalid ID (GET /tasks/:id):  
```bash
curl -X GET http://localhost:3000/tasks/10 \
  -H "Authorization: Bearer "
```
Output:  
```{"error":"Task not found."}```
<br><br><br>

Fetch a specific task by ID (GET /tasks/:id):  
```bash
curl -X GET http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer "
```
Output:  
```{"id":1,"title":"Create test plan","description":"Enter curl commands and outputs into README.md","status":"todo","projectID":1,"assignedTo":2,"createdAt":"2026-07-31T04:50:53.645Z","updatedAt":"2026-07-31T04:50:53.645Z"}```
<br><br><br>

Attempt to update a task with a blank field (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"status": ""}'
```
Output:  
```{"error":"A status is required."}```
<br><br><br>

Attempt to update a task with an invalid project ID (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"project_id": "10"}'
```
Output:  
```{"error":"Invalid project ID."}```
<br><br><br>

Attempt to update a task with an invalid user ID (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"assigned_to": "10"}'
```
Output:  
```{"error":"Invalid user ID."}```
<br><br><br>

Attempt to update a task that does not exist (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"status": "done"}'
```
Output:  
```{"error":"Task not found."}```
<br><br><br>

Update a task (PATCH /tasks/:id):  
```bash
curl -X PATCH http://localhost:3000/tasks/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"status": "done"}'
```
Output:  
```{"id":2,"title":"Answer reflection questions","description":"Enter answers to reflection questions into README.md","status":"done","project_id":1,"assigned_to":2,"created_at":"2026-07-31T04:53:44.248Z","updated_at":"2026-07-31T05:37:27.392Z"}```
<br><br><br>

Attempt to delete a task with an invalid ID (DELETE /tasks/:id):  
```bash
curl -X DELETE http://localhost:3000/tasks/10 \
  -H "Authorization: Bearer "
```
Output:  
```{"error":"Task not found."}```
<br><br><br>

Delete a task (DELETE /tasks/:id):  
```bash
curl -X DELETE http://localhost:3000/tasks/2 \
  -H "Authorization: Bearer "
```
Output:  

<br><br><br>

Check that the task was deleted (GET /tasks):
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer "
```
Output:  
```[{"id":1,"title":"Create test plan","description":"Enter curl commands and outputs into README.md","status":"todo","projectID":1,"assignedTo":2,"createdAt":"2026-07-31T04:50:53.645Z","updatedAt":"2026-07-31T04:50:53.645Z"}]```
<br><br><br>

Attempt to access user list (GET /users):
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer "
```
Output:  
``````
<br><br><br>

Register a new user account (POST /auth/register):
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "user2", "email": "useremail@gmail.com", "password": "new-password"}'
```
Output:  
``````
<br><br><br>

Login as the new user (POST /auth/login):
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user2", "password": "new-password"}'
```
Output:  
``````
<br><br><br>

Attempt to modify a resource not owned by the current user (PATCH /tasks/:id):
```bash
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"status": "done"}'
```
Output:  
``````
<br><br><br>

Attempt to delete a resource not owned by the current user (DELETE /task/:id):
Delete a task (DELETE /tasks/:id):  
```bash
curl -X DELETE http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer "
```
Output:  

<br><br><br>

Login as the admin (POST /auth/login):
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin-password"}'
```
Output:  
``````
<br><br><br>

As an admin, access user list (GET /users):
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer "
```
Output:  
``````
<br><br><br>

As an admin, modify a resource not owned by the admin (PATCH /tasks/:id):
```bash
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{"status": "done"}'
```
Output:  
``````
<br><br><br>

As an admin, delete a resource not owned by the admin (DELETE /task/:id):
Delete a task (DELETE /tasks/:id):  
```bash
curl -X DELETE http://localhost:3000/tasks/1 \
  -H "Authorization: Bearer "
```
Output:  

<br><br><br>

Check that the task was deleted (GET /tasks):
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer "
```
Output:  
``````
<br><br><br>

