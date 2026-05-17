# Store Rating Platform

1. Project Overview

The Store Rating Platform is a robust, production-ready full-stack web application designed to facilitate user-submitted store reviews while enforcing strict Role-Based Access Control (RBAC). Built as a technical assignment submission for Roxiler Systems, this platform seamlessly isolates functionality across three distinct system roles: System Administrators, Store Owners, and Normal Users.

# Core Technology Stack
- Backend Environment: Node.js, Express.js
- Database & ORM: MySQL 8.0+, Sequelize ORM
- Frontend Framework: React.js (Vite)
- State Management & Routing: React Context API, React Router DOM
- API Communication: Axios (with Interceptors)
- Security: JSON Web Tokens (JWT), Bcrypt, Express-Validator

---

# 2. Key Features Implemented

* Strict Role-Based Access Control (RBAC): Dedicated routing and controller separation for Admins, Owners, and Users, preventing horizontal and vertical privilege escalation.
* Unified Authentication: A single login portal that dynamically decodes the JWT payload to intelligently route the user to their designated dashboard.
* Server-Side Data Aggregation: Complex calculations (like overall store average ratings) are performed via Sequelize relations on the backend, ensuring a lightweight and performant frontend.
* Backend-Driven Filtering & Sorting: Dynamic data tables utilize `WHERE` and `ORDER` query parameters, ensuring paginated data sets remain highly performant at scale.
* Comprehensive Validation Constraints: Strict regex and length rules (e.g., Name > 20 chars, complex passwords) enforced natively on the backend via `express-validator` and mirrored on the React frontend for real-time user feedback.
* Upsert Rating Logic: Users are programmatically restricted to a single rating per store, managed via atomized database upsert checks.

---

# 3. Project Directory Structure

```text
store-rating-platform/
├── client/                     # React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components (ProtectedRoute, Modals)
│   │   ├── context/            # AuthContext for global JWT state management
│   │   ├── pages/              # Role-specific Dashboards (Admin, Owner, User)
│   │   ├── services/           # Axios interceptor configuration (api.js)
│   │   ├── App.jsx             # Main router and layout orchestrator
│   │   └── main.jsx            # React initialization
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js Backend Application
│   ├── config/
│   │   └── database.js         # Sequelize MySQL connection pool
│   ├── controllers/            # Isolated business logic by role
│   ├── middlewares/            # JWT verification and Express Validators
│   ├── models/                 # Sequelize schema definitions (User, Store, Rating)
│   ├── routes/                 # Express REST endpoint declarations
│   ├── .env                    # Environment variables (Ignored in Git)
│   ├── package.json
│   └── server.js               # Global application entry and error handling
│
└── README.md
```

---

# 4. Database Setup Instructions

This application relies on MySQL. The application utilizes Sequelize's `.sync({ alter: true })` synchronization feature, meaning you do not need to manually execute migration scripts or write raw SQL schema files.

1. Ensure MySQL Server is installed and running locally.
2. Open your preferred MySQL client (e.g., MySQL Workbench, DBeaver, or CLI).
3. Create a blank database for the project:
   ```sql
   CREATE DATABASE store_rating_db;
   ```
4. Upon starting the Node.js server for the first time, Sequelize will automatically detect the database and build the `Users`, `Stores`, and `Ratings` tables with all necessary foreign-key constraints.

---

# 5. Environment Variables (`.env`)

You must configure environment variables for the backend to successfully connect to your local MySQL instance.

Create a `.env` file inside the `server/` directory and populate it with the following blueprint:

```env
# server/.env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_NAME=store_rating_db
DB_USER=root
DB_PASS=your_mysql_password
DB_HOST=localhost

# Security
JWT_SECRET=roxiler_super_secret_assignment_key_2026
```

*(Note: The React frontend utilizing Vite assumes the backend is operating on `http://localhost:5000/api` natively through the `src/services/api.js` configuration).*

---

# 6. Installation & Running the Application

Please execute the following terminal commands to boot the platform locally.

# Step 1: Start the Backend (Node/Express)
Open a new terminal window:
```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Start the API server
node server.js
# Or, if nodemon is installed globally: npm run dev
```
*You should see a console log confirming: "Database synchronized successfully. Server is running..."*

### Step 2: Start the Frontend (React/Vite)
Open a second, separate terminal window:
```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The terminal will output a local URL (usually `http://localhost:5173`). Open this in your browser.*

---

# 7. Default Testing Credentials

To evaluate the Role-Based Access Control properly, you will need to manually insert a user with the `ADMIN` role directly into your database to bypass the initial cold-start.

# Creating the Master Admin (Cold Start)
Execute this raw SQL directly in your MySQL client to generate an Admin user (Password hashed via Bcrypt for: `Admin@123`):

```sql
INSERT INTO Users (id, name, email, password, address, role, createdAt, updatedAt)
VALUES (
    uuid(),
    'Master System Administrator',
    'admin@roxiler.com',
    '$2b$10$oX3zW./T5A/5k8Yp9Gq.3uH8S9P/T5A/5k8Yp9Gq.3uH8S9P', 
    'Roxiler Systems HQ',
    'ADMIN',
    NOW(),
    NOW()
);
```

### Mock Test Data
*(Note: All passwords enforce the strict constraint: 8-16 chars, 1 uppercase, 1 special).*

| Role | Mock Email | Mock Password | Notes |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@roxiler.com` | `Admin@123` | Login to create Stores and Assign Owners. |
| **Store Owner** | *(Create via Admin Dashboard)* | `Owner@1234` | Will see a beautifully rendered "Empty State" until users rate their store. |
| **Normal User** | *(Register via UI)* | `User@2026` | **Important:** The registration UI strictly enforces a Minimum 20 Character Name constraint as requested in the specifications. |
