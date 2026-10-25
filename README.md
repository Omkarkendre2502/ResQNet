# ResQNet – Smart Emergency Response & Disaster Management System (Pune Zone)

A hardened, production-ready full-stack emergency response and disaster management web platform engineered for **Pune Municipal Area, Maharashtra**. Built with a **React 19 + Vite + Bootstrap 5** frontend and a **Node.js + Express 4 + MongoDB (Mongoose 9)** backend with **strict JWT authentication**, role-based access control, cryptographic auditing, atomic ID sequencing, and responsive emergency dispatch workflows.

---

## 🚀 Quick Start Guide

### System Requirements
- **Node.js**: v18+ (tested on Node.js v24)
- **MongoDB**: Community Server running locally on `mongodb://127.0.0.1:27017/resqnet`
- **npm**: v9+

---

### 1. Environment Configuration

#### Backend (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/resqnet
JWT_SECRET=super_secret_pune_resqnet_jwt_key_at_least_32_chars_long_2026!
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```ini
VITE_API_URL=http://localhost:5000/api
```

---

### 2. Installation & Running

#### Step A: Install Dependencies
```powershell
# In server directory
cd server
npm install

# In client directory
cd ..\client
npm install
cd ..
```

#### Step B: Provision Initial Administrator Account
ResQNet contains **zero hardcoded passwords or pre-seeded accounts**. Provision the initial root administrator using the secure CLI provisioning tool:

```powershell
cd server
npm run create-admin
```
*You will be interactively prompted for Name, Email, Phone, and Password (hidden input).*

Alternatively, run with non-interactive CLI arguments:
```powershell
npm run create-admin -- --email admin@resqnet.org --password "AdminSecure#2026!" --name "Rahul Patil" --phone "+91 98230 45678"
```
> **Security Requirement**: Administrator passwords must be at least 12 characters long and contain uppercase, lowercase, a number, and a special character. Hashed with bcrypt cost 12.

#### Step C: Start Backend Server
```powershell
cd server
npm start
```
*Server runs on `http://localhost:5000`. Health check at `http://localhost:5000/api/health`.*

#### Step D: Start Frontend Client
```powershell
cd client
npm run dev
```
*Client application runs on `http://localhost:5173`.*

#### Step E: Run Automated Security Test Suite
```powershell
cd server
npm test
```
*Runs the automated test suite (`node:test`) covering 17 security assertions: 401 unauthenticated blocking, 403 authorization checks, 403 cross-squad isolation, 400 input validation, 409 status transition enforcement, role escalation prevention, query data isolation, account lockout protection on 5 failed attempts, password change verification, and admin user status management.*

---

## 👥 Access Roles & Portal Portfolios

ResQNet is a **login-only** platform. Unauthenticated visitors see the public landing page with emergency helplines and can sign in or register as a citizen.

| Role | Provisioning Method | Available Portals & Capabilities |
| :--- | :--- | :--- |
| **Citizen** | Self-registration via `/login` (`POST /api/auth/register`) | 4-step emergency reporting wizard with GPS & photo upload, personal dashboard tracking reported incidents, live progress stepper, emergency helpline contacts. |
| **Rescue Squad** | Created exclusively by Administrator via Admin Control Center | Dedicated Squad Dispatch Terminal (`PERT-01`, `PERT-02`, `PERT-03`), 1-click prominent operational progression (`Assigned` &rarr; `On the Way` &rarr; `Reached` &rarr; `In Progress` &rarr; `Completed`), squad mission history, base station details. |
| **Administrator** | Provisioned via CLI `npm run create-admin` | Control Center dashboard, squad dispatch and incident assignment, user directory management, temporary password resets, account activation/deactivation, rescue squad account provisioning, full activity audit log trail, CSV incident export. |

---

## 📡 Complete Backend API Specification

Base URL: `http://localhost:5000/api`

### Authentication & Self-Service
| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Returns service health status and timestamp (no sensitive system info). |
| `POST` | `/auth/register` | Public | Registers a new citizen account. Enforces `role: 'citizen'`, password complexity, and returns `{ message, user }` (no auto-login). |
| `POST` | `/auth/login` | Public | Authenticates credentials with rate limiting and 5-attempt lockout (15 min lock). Returns JWT bearer token. |
| `GET` | `/auth/me` | Authenticated | Retrieves authenticated user profile from verified bearer token. |
| `PATCH` | `/auth/change-password` | Authenticated | Updates account password. Verifies current password and enforces complexity. |

### Emergency Incidents
| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/incidents` | Authenticated | Fetches incidents with role-based data isolation (citizens see only own reports; squads see only assigned missions; admins see all). |
| `GET` | `/incidents/:id` | Authenticated | Fetches single incident by ID. Sanitizes reporter contact info for non-owners. |
| `POST` | `/incidents` | Authenticated | Reports emergency with multipart photo upload (2MB limit, JPEG/PNG/WebP), atomic sequential ID (`INC-0001`), and rate limiting. |
| `PATCH` | `/incidents/:id/assign` | `admin` | Dispatches and assigns rescue squad to incident. Updates team status to `Deployed` and logs audit entry. |
| `PATCH` | `/incidents/:id/status` | `rescue`, `admin` | Advances operational status forward. Enforces squad boundary checks and audit logging. |

### Rescue Squads
| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/rescue-teams` | Authenticated | Lists registered Pune rescue squads (`PERT-01`, `PERT-02`, `PERT-03`) with readiness status. |
| `GET` | `/rescue-teams/:id` | Authenticated | Retrieves specific squad details. |
| `PATCH` | `/rescue-teams/:id` | `rescue`, `admin` | Updates squad status or location (rescue squads restricted to own unit). |

### Administrator Control Center
| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | `admin` | High-level metrics: user counts by role, incident breakdown, squad availability. |
| `GET` | `/admin/users` | `admin` | Paginated user directory with search by name/email/phone/team, role filter, and status filter. |
| `GET` | `/admin/users/:id` | `admin` | User profile details and recent reported incidents history. |
| `PATCH` | `/admin/users/:id` | `admin` | Edits user profile (name, email, phone) with duplicate checks and audit logging. |
| `PATCH` | `/admin/users/:id/status` | `admin` | Activates or disables user account. Protects against self-deactivation and deactivating the last active administrator. |
| `POST` | `/admin/users/:id/reset-password` | `admin` | Generates a 12-character high-entropy temporary password, sets `mustChangePassword: true`, and logs audit entry. |
| `DELETE` | `/admin/users/:id` | `admin` | Deletes user account with safeguards preventing self-deletion and last admin deletion. |
| `POST` | `/admin/rescue-users` | `admin` | Provisions a new login account attached to a specific Pune rescue squad unit. |
| `GET` | `/admin/audit-logs` | `admin` | Retrieves the immutable audit log trail of administrative actions and status transitions. |

---

## 🛡️ Security Architecture & Hardening Highlights

### 1. Zero Demo Fallbacks & Hardened Secrets
- **No Mock Fallback Data**: Client state interacts exclusively with live server APIs; legacy offline hardcoded arrays have been eliminated.
- **Session-Only Tokens**: JWT tokens are stored strictly in `sessionStorage`, ensuring credentials do not persist indefinitely in `localStorage`.
- **Enforced JWT Secret Entropy**: Server verifies `JWT_SECRET` at boot and refuses to start if missing or under 32 characters.
- **Password Hashing**: Bcrypt salt cost 12 on all accounts.

### 2. Account Lockout & Brute-Force Defense
- **5-Attempt Lockout**: Accounts are automatically locked for 15 minutes after 5 consecutive failed login attempts.
- **Multi-Tier Rate Limiting**:
  - Global API: 200 requests per 15 minutes.
  - Auth endpoints: 10 requests per 15 minutes.
  - Emergency reporting: 20 reports per hour.
- **Generic Error Responses**: Rejects invalid logins with `"Invalid email or password"` without leaking account existence.

### 3. Server-Enforced Role Isolation & Privilege Control
- **Strict Data Isolation**: Citizens only receive their own incident documents via MongoDB query filters. Rescue squads only receive incidents assigned to their designated squad ID (`req.user.teamId`).
- **Tampering Resistance**: Public registration ignores any role passed in the request body and strictly assigns `citizen`.
- **Admin Safeguards**: Administrators cannot deactivate or delete their own accounts, nor can the last remaining administrator account be disabled.

### 4. Comprehensive Audit Trail
- **Cryptographic Audit Logging**: All sensitive mutations (incident dispatch, status transitions, profile edits, temporary password resets, account toggles, and user deletions) record actor ID, name, email, role, action, target, IP address, and metadata in MongoDB.

### 5. Input Validation & Database Optimization
- **Express-Validator**: Every endpoint enforces strict whitelist validation on emergency types, severity levels, statuses, and coordinates.
- **Compound Database Indexes**:
  - `Incident`: `{ status: 1, reportedAt: -1 }`, `{ reportedById: 1, reportedAt: -1 }`, `{ assignedTeamId: 1, status: 1 }`, `{ severity: 1 }`.
  - `User`: `{ email: 1 }` (unique), `{ role: 1 }`, `{ role: 1, isActive: 1 }`, `{ teamId: 1 }`.
- **Atomic ID Generation**: Uses atomic MongoDB sequence counter generation (`INC-0001`, `INC-0002`) to guarantee collision-free sequential tracking.

---

## 🎨 User Experience Enhancements

- **4-Step Emergency Reporting Wizard**: Progressive stepper with validation:
  1. *Category & Urgency*: Emergency type and severity selector.
  2. *Pune Locality*: Presets (Kothrud, Shivaji Nagar, Hadapsar, Viman Nagar, etc.) with Pune map coordinates and browser GPS locator.
  3. *Situation & Media*: Description, casualties affected, and drag-and-drop scene photo upload with live preview.
  4. *Review & Dispatch*: Summary card before confirmed submission.
- **Citizen Dashboard**: Search by Incident ID or Pune locality, quick filter buttons (Active / Resolved), and visual step progress bars.
- **Rescue Squad Terminal**: Prominent single NEXT ACTION button based on current status (`Assigned` &rarr; `On the Way` &rarr; `Reached` &rarr; `In Progress` &rarr; `Completed`), completed mission history tab, and squad commander manual override.
- **Admin Control Center**: User directory management table, status toggle badges, temporary password generator modal, CSV incident export, sortable columns, and activity log viewer.
- **Live Auto-Refresh & System Alerts**:
  - 20-second background polling with "Updated [time]" pill and spinning manual refresh button.
  - Notification bell with unread badge and dropdown list linking directly to incidents.
- **User Profile Modal**: Accessible from Navbar and Sidebar with profile details, live visual password strength meter for password updates, and sign-out confirmation.
