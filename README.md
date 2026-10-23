# ResQNet – Smart Emergency Response & Disaster Management System (Pune Zone)

A modern, full-stack emergency response and disaster management web platform built for **Pune, Maharashtra**, featuring a **React.js + Bootstrap** frontend and a **Node.js + Express + MongoDB (Mongoose)** backend with **JWT authentication** and role-based access.

---

## 🍃 MongoDB Database Architecture

- **Database Name**: `resqnet`
- **Connection URI**: `mongodb://127.0.0.1:27017/resqnet` (configurable via `server/.env`)
- **Collections Reused & Managed**:
  1. **`users`**: Stores registered citizens, admin authorities, and rescue squad accounts with hashed passwords (`bcryptjs`) and roles (`citizen`, `admin`, `rescue`).
  2. **`incidents`**: Stores emergency incident reports with unique reference IDs (e.g. `INC-2452`), Pune GPS coordinates, severity levels, timeline events, and assigned rescue squads.
  3. **`rescueteams`**: Stores operational Pune rescue squads (`PERT-01`, `PERT-02`, `PERT-03`) with readiness statuses (`Available`, `Assigned`, `In Progress`).

---

## 🔐 Authentication & Roles

JWT-based authentication is implemented with tokens signed using `JWT_SECRET` in `server/.env`:

| Role | Default Name | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Priya Sharma | `citizen@resqnet.org` | `password123` | Report emergencies, track reported incident statuses & timelines |
| **Admin** | Rahul Patil | `admin@resqnet.org` | `adminpassword` | Control center overview, view all incidents, assign rescue squads |
| **Rescue Squad** | Pune Emergency Response Team 01 | `rescue@resqnet.org` | `rescuepassword` | View assigned squad missions, update status through all 5 operational steps |

---

## 📡 REST API Reference

Base URL: `http://localhost:5000/api`

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new citizen account.
- `POST /api/auth/login` - Authenticate user and receive JWT token.
- `GET /api/auth/me` - Get profile of the currently logged-in user.

### 2. Emergency Incidents (`/api/incidents`)
- `GET /api/incidents` - Get all incidents (supports filters: `status`, `severity`, `type`, `assignedTeamId`).
- `GET /api/incidents/:id` - Get incident details by ID.
- `POST /api/incidents` - Report a new emergency.
- `PATCH /api/incidents/:id/assign` - Admin assigns a rescue squad to an incident.
- `PATCH /api/incidents/:id/status` - Rescue squad updates status (`Assigned` &rarr; `On the Way` &rarr; `Reached` &rarr; `In Progress` &rarr; `Completed`).

### 3. Rescue Squads (`/api/rescue-teams`)
- `GET /api/rescue-teams` - Get all rescue squads and their availability.
- `GET /api/rescue-teams/:id` - Get details of a single squad.
- `PATCH /api/rescue-teams/:id` - Update squad status or base location.

---

## 🏃 PowerShell Commands to Run the Project

### Step 1: Install Dependencies (If not already installed)

In **PowerShell** in the project root:

```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..\client
npm install
cd ..
```

---

### Step 2: Start the Backend Server (Express + MongoDB)

Open a **PowerShell** window:

```powershell
cd server
npm start
```

You should see:
```text
=======================================================
ResQNet Backend API Server running on port 5000
Health Check: http://localhost:5000/api/health
=======================================================
[MongoDB] Connected successfully to: 127.0.0.1:27017/resqnet
[MongoDB] Preserving existing users collection (3 users found).
```

---

### Step 3: Start the Frontend Client (React + Vite)

Open a **second PowerShell** window:

```powershell
cd client
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔄 End-to-End Incident Workflow Verification

1. **Citizen Reports Incident**:
   - Go to **Report Emergency** on the citizen portal.
   - Enter Pune location (e.g. `Kothrud` or `Shivajinagar`), severity, and description.
   - Click **Submit Emergency Report**.
   - The incident is saved to MongoDB in the `incidents` collection.
2. **Admin Assigns Rescue Squad**:
   - Log in or switch to **Admin (Rahul Patil)**.
   - Open **Admin Dashboard** &rarr; see the unassigned incident in the queue.
   - Click **Assign** &rarr; choose **Pune Emergency Response Team 01 (PERT-01)**.
   - The incident in MongoDB is updated with `assignedTeamId: 'PERT-01'` and `status: 'Assigned'`.
3. **Rescue Squad Advances Status**:
   - Switch to **Rescue Squad (PERT-01)**.
   - The incident appears under **Active Missions**.
   - Click **On the Way** &rarr; **Reached** &rarr; **In Progress** &rarr; **Completed**.
   - When marked **Completed**, the squad is returned to `Available`, and the mission moves to **Completed History**.
4. **Real-Time Cross-Dashboard Sync**:
   - Open **Citizen Dashboard**: The status reflects `Completed`.
   - Open **Admin Dashboard**: The status reflects `Completed`.
   - Refresh **MongoDB Compass**: The `incidents` document in `resqnet` contains all timeline events and final status.
