# Last-Mile Delivery Tracker

A full-stack logistics management platform to automate package delivery pricing, zone detection, agent assignment, shipment tracking timelines, and email alerts. It provides specialized portal interfaces for Customers, Delivery Agents, and Administrators.

---
# Deployment URL
https://last-mile-delivery-tracker-mu.vercel.app/

## 🚀 Key Features

* **Dynamic Pricing Engine**: Calculates shipment cost based on volumetric properties `(Length * Breadth * Height) / 5000` vs. actual weight, route zones, prepaid/COD methods, and customer tiers.
* **Geographical Zone Detection**: Extracts pickup/drop pincodes and resolves associated shipping zones.
* **Auto-Assignment Dispatcher**: Instantly queries for available on-duty couriers in the pickup zone and triggers assignments.
* **Immutable Tracking Timelines**: Generates sequential audit trails for all delivery state transitions (Created, Picked Up, In Transit, Out for Delivery, Delivered, Failed, Rescheduled).
* **Mandatory Failure Remarks**: Requires delivery agents to register notes justifying why package delivery attempts failed.
* **Email Notification Dispatch**: Sends transaction updates using Nodemailer. Defaults to a temporary test account using Ethereal Mail if no SMTP credentials are provided, printing preview URLs to the logs.
* **Rescheduling Loops**: Customers can reschedule failed packages, resetting their queues for auto-assignment attempts.
* **Zero-Config DB Fallback**: Detects MongoDB connections. If MongoDB is not running locally or fails to connect, the server automatically boots in **Mock DB Mode**, storing collections in local JSON files in `server/data/`. This makes local development completely plug-and-play.

---
# 📸 Screenshots

## 🏠 Landing Page<img width="1470" height="956" alt="Screenshot 2026-07-04 at 12 39 37 AM" src="https://github.com/user-attachments/assets/9918dec5-1d2b-43ba-a65f-8272bee554d1" />


## Login Page<img width="1470" height="956" alt="Screenshot 2026-07-04 at 12 39 52 AM" src="https://github.com/user-attachments/assets/6af287c6-27ab-47dc-95c0-d37840f8639e" />

## Admin Page<img width="1470" height="956" alt="Screenshot 2026-07-04 at 12 40 09 AM" src="https://github.com/user-attachments/assets/b44861d1-e07c-4832-b879-17c396f8b950" />

"" Admin<img width="1470" height="956" alt="Screenshot 2026-07-04 at 12 40 19 AM" src="https://github.com/user-attachments/assets/061e474a-54df-479e-b59b-c5169f045cf6" />

## Customer Page<img width="1470" height="956" alt="Screenshot 2026-07-04 at 12 40 36 AM" src="https://github.com/user-attachments/assets/0556fdf4-6682-4801-a7b6-7cef767cca73" />

## Delivery Agent Page<img width="1470" height="956" alt="Screenshot 2026-07-04 at 12 41 11 AM" src="https://github.com/user-attachments/assets/73f17de5-a030-4db1-b234-f6f443861b04" />


## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS v4, Axios, React Router, Lucide Icons
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (via Mongoose) OR Local JSON storage (Automatic fallback)
* **Auth**: JWT (JSON Web Tokens), bcryptjs
* **Notifications**: Nodemailer (Ethereal test mailbox integration)

---

## 🏃 Getting Started (Quick Start)

### 1. Prerequisites
* [Node.js](https://nodejs.org/) installed on your machine.
* MongoDB (Optional - if not running, the application will automatically fall back to local JSON database storage).

### 2. Seeding & Running Backend
Open a terminal in the `server` directory:

```bash
cd server
npm install
npm run seed  # Seeds admin, customer, agents, zones and rate cards
npm run dev   # Starts backend on http://localhost:5000
```

### 3. Running Frontend
Open a new terminal in the `client` directory:

```bash
cd client
npm install
npm run dev   # Starts Vite server on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 🔑 Default Test Credentials (Seeded)

| Portal Persona | Email | Password | Role / Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@tracker.com` | `Password123` | Control Panel, Zone Mapping, Rate Cards Editor, Courier Dispatch, overrides. |
| **Customer** | `customer@tracker.com` | `Password123` | Book Shipments, Volumetric Quote Calculator, Orders history, reschedule fail loops. |
| **Courier Agent A** | `agent1@tracker.com` | `Password123` | On-Duty Online toggle, Zone A deliveries, transition state checklists. |
| **Courier Agent B** | `agent2@tracker.com` | `Password123` | On-Duty Online toggle, Zone B deliveries, transition state checklists. |

---

## 📂 Project Layout

```
LastMileDeliveryTracker/
│
├── server/                 # Express REST API
│   ├── config/             # DB & Mock Mongoose layers
│   ├── controllers/        # Route logic (Auth, Admin, Agent, Orders)
│   ├── middleware/         # Auth verification guards
│   ├── models/             # Dynamic Mongoose/Mock Schemas
│   ├── routes/             # Unified API mapping
│   ├── services/           # Pricing and Nodemailer services
│   ├── utils/              # Database seeding
│   ├── data/               # Local JSON databases (Mock DB Fallback target)
│   └── package.json
│
├── client/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/     # Headers, Protected Routes, Stepper timelines
│   │   ├── pages/          # Dashboards (Customer, Agent, Admin, Login/Register)
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx         { React Router routes mapping }
│   │   ├── index.css       { Global design variables & animations }
│   │   └── main.jsx
│   ├── vite.config.js      { Tailwind plugins & Proxy configs }
│   └── package.json
│
└── README.md
```

---

## 🛡️ API Endpoints

### Authentication
* `POST /api/auth/register` - Create customer/agent credentials.
* `POST /api/auth/login` - Sign in and retrieve JWT.
* `GET /api/auth/me` - Retrieve current session details.

### Bookings & Calculating
* `POST /api/orders` - Place package delivery.
* `POST /api/orders/calculate-quote` - Preview prices based on L x B x H and Weight.
* `GET /api/orders` - List user orders (All for Admin, assigned for Agent).
* `GET /api/orders/:id` - Show individual order spec.
* `PUT /api/orders/:id/reschedule` - Reschedule failed shipments.
* `GET /api/tracking/:orderId` - Chronological delivery history audit logs.

### Administration
* `POST /api/admin/zones` - Register geographic delivery zones.
* `GET /api/admin/zones` - Query zones list.
* `POST /api/admin/ratecards` - Configure route pricing card.
* `PUT /api/admin/ratecards/:id` - Update base rates/surcharges.
* `DELETE /api/admin/ratecards/:id` - Remove rate card.
* `GET /api/admin/agents` - Roster of courier agent profiles.
* `POST /api/admin/assign` - Manually assign agent to order.
* `POST /api/admin/assign/auto/:orderId` - Trigger auto-dispatcher calculations.
* `PUT /api/admin/orders/:id/override` - Force status update and log admin remarks.

### Agent Duties
* `GET /api/agent/orders` - List active courier dispatches.
* `PUT /api/agent/availability` - Toggle Online/Offline duty status.
* `PUT /api/agent/orders/:id/status` - Advance shipment states (Picked Up, In Transit, Out for Delivery, Delivered, Failed).
