# QueueZero (Q-Zero) — Smart Campus Printing Platform
> **Print Smarter. Wait Less.**  
> Autonomous Campus Print Fleet Management, Zero-Wait Token Telemetry & Cloud Dispatch.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![NodeJS](https://img.shields.io/badge/Node.js-24.20-339933)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38b2ac)

---

## 1. Executive Summary & Problem Solved

Traditional campus printing is burdened by long counter queues (25 to 45-minute lines during lab submissions and exam schedules), unmanaged walk-ups, manual paper counting, currency handling, and compromised document privacy.

**QueueZero (Q-Zero)** decouples document ingress from physical print execution:
1. Students upload PDF or DOCX documents from any device.
2. Automated page counting and color detection estimate prices dynamically.
3. Configure duplex eco-printing (-15% discount), paper size, orientation, and binding.
4. Locate real-time campus kiosks on an interactive Leaflet map with live paper/toner telemetry and queue wait times.
5. Select **Mode A: Instant Walk-up Dispatch** (&lt;10s walk-up SLA) or **Mode B: Scheduled Time Slot**.
6. 1-click payment settlement via unified campus smart wallet or Razorpay sandbox.
7. Automated generation of unique **8-character collection tracking code** (e.g. `8XUI-Z123`).
8. Removable 0.5-inch perforated tracking margin on printed sheets matches sealed tamper-proof envelopes.
9. Kiosk Operator verifies university ID card, student roll number, envelope seal, and optional security OTP before handing over the document.

---

## 2. Visual Design System

Designed to match the Q-Zero visual identity and dashboard specification:

| Element | Hex Code | Purpose |
|---|---|---|
| **Primary Purple** | `#7047EB` | Primary branding, buttons, active sidebar pill |
| **Deep Purple** | `#5526CC` | Gradients, dark headers, active toggles |
| **Lavender** | `#F3EFFF` | Banner gradients, hover pills, soft backgrounds |
| **Background** | `#F8F7FF` | Clean campus aesthetic app background |
| **White** | `#FFFFFF` | Cards, elevated sheets, modals |
| **Dark Text** | `#17152F` | High-contrast typography |
| **Turquoise** | `#35C6C0` | Secondary metrics, live telemetry pins |
| **Success** | `#22C55E` | Ready status, completed orders, green meters |
| **Warning** | `#F59E0B` | Rush priority, maintenance alerts |

- **Typography**: Inter
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS keyframe pulse

---

## 3. Technology Stack

### Frontend
- **React.js 18** with **TypeScript**
- **Vite 6** (production build & HMR)
- **Tailwind CSS 3.4**
- **React Router 6**
- **Framer Motion**
- **Lucide React** (icons)
- **Recharts** (donut statistics & fleet utilization telemetry)
- **Leaflet & React-Leaflet** (interactive campus map)
- **QRCode.react** (dynamic token barcode generation)
- **Canvas-Confetti** (celebratory order dispatch effects)

### Backend
- **Node.js** & **Express.js** (REST API architecture)
- **TypeScript** & **TSX**
- **Prisma ORM** (with transaction-safe operations)
- **Zod** (schema & payload validation)
- **JWT** (JSON Web Tokens) & **bcryptjs** (secure credential hashing)
- **Multer** (document ingestion, size validation, and MIME filtering)

### Database
- **PostgreSQL / SQLite via Prisma ORM**: Out-of-the-box local database (`dev.db`) seeded with realistic accounts, orders, kiosks, and notifications. Ready for production PostgreSQL via `DATABASE_URL`.

---

## 4. Mathematical Dispatch & Load Balancing Formulation

As specified in the *Queue Zero Architecture Specification*:

### Priority Rank Equation
$$P_i = \left(\frac{w_i}{\text{EPT}_i}\right) + \alpha \cdot T_{\text{wait}}$$

- $w_i$: Priority weight (1.0 for normal, 3.0 for Instant Mode, 10.0 for walk-up physical check-in).
- $\text{EPT}_i$: Estimated Print Time in minutes (Shortest Job First heuristic).
- $T_{\text{wait}}$: Waiting duration since order confirmation in minutes.
- $\alpha$: Dynamic wait escalation constant (0.80) to prevent starvation.

### Estimated Print Time (EPT)
$$\text{EPT} = T_{\text{warm}} + \left(\frac{N_{\text{pages}}}{\text{PPM}_{\text{node}}}\right)$$
- $T_{\text{warm}}$: Engine warmup latency (8 seconds).
- $\text{PPM}_{\text{node}}$: Pages Per Minute speed of target kiosk printer (30–50 PPM).

### Scrap Prevention Ratio (SPR)
$$\text{SPR} = 1 - \left(\frac{\text{Jobs}_{\text{uncollected}}}{\text{Jobs}_{\text{total}}}\right)$$
Maintains uncollected scrap below 0.05% via token holds and automated reminders.

---

## 5. Demo Accounts (Hackathon Presentation)

For effortless evaluation, the application includes a **1-click Role Switcher** at the top of the screen:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `nischal@campus.edu` | `password123` | Nischal Chowdary (Roll: 2614213032), ₹245.50 balance |
| **Administrator** | `admin@campus.edu` | `admin123` | Dr. A. Sharma (Campus IT & Auxiliary Services) |
| **Kiosk Operator**| `operator@campus.edu` | `operator123` | Ramesh Kumar (Central Print Hub Station Desk) |

---

## 6. End-to-End User Journey Verification

The system was verified with a complete automated test (`backend/src/e2e-test.ts`):

```
Student registers (Roll: ROLL-194579)
  ↳ Claimed ₹250 promotional printing credits
  ↳ Authenticated with JWT session
  ↳ Ingests PDF document ("AI_Systems_Lab_Submission.pdf")
  ↳ AI page analyzer detects 12 pages
  ↳ Configures Double-Sided Duplex (-15% eco-discount)
  ↳ Enables Removable Tracking-Code Margin
  ↳ Selects "Academic Block Kiosk (K-ACAD)" on campus map
  ↳ Reserves 9:00 AM pickup slot
  ↳ Locks order & generates unique token: [ CBZY-3QZD ]
  ↳ Settles payment via Campus Smart Wallet
  ↳ Spool status advances to QUEUED
  ↳ Admin moves order to PRINTING and READY_FOR_PICKUP
  ↳ Student receives in-app alert: "Your Print Is Ready! 🎉"
  ↳ Kiosk Operator looks up tracking code [ CBZY-3QZD ]
  ↳ Matches student registration number & sealed envelope
  ↳ Confirms handover -> Order marked COLLECTED.
```

---

## 7. Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Launch (Windows)
Double-click `start-demo.bat` in the project root. This starts both the Backend API (Port 5000) and Frontend Application (Port 5173).

### Manual Setup

1. **Backend**:
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run build
npm start
```

2. **Frontend**:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 8. REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Student registration with roll number | Public |
| `POST` | `/api/auth/login` | Student / Staff JWT authentication | Public |
| `POST` | `/api/auth/demo-login` | 1-click role switcher login | Public |
| `GET` | `/api/auth/me` | Current user profile & smart card | Bearer JWT |
| `POST` | `/api/documents/upload` | Upload PDF/DOCX & analyze pages | Bearer JWT |
| `GET` | `/api/documents` | List stored documents in vault | Bearer JWT |
| `PUT` | `/api/documents/:id/settings` | Update print settings & calculate price | Bearer JWT |
| `GET` | `/api/kiosks` | List all campus kiosks with telemetry | Public |
| `GET` | `/api/slots/kiosk/:kioskId` | Get pickup slots for a kiosk | Public |
| `POST` | `/api/orders/create` | Create order & generate 8-char tracking code | Bearer JWT |
| `GET` | `/api/orders` | List user's print orders with filters | Bearer JWT |
| `GET` | `/api/orders/dashboard-summary`| Get upcoming pickup & stats for dashboard | Bearer JWT |
| `GET` | `/api/orders/:code` | Live tracking timeline by tracking code | Bearer JWT |
| `POST` | `/api/payments/pay` | Settle payment via Wallet or Razorpay sandbox | Bearer JWT |
| `POST` | `/api/payments/top-up-wallet` | Add funds to campus wallet | Bearer JWT |
| `GET` | `/api/verification/lookup/:code` | Operator lookup of order by tracking code | Operator/Admin |
| `POST` | `/api/verification/confirm-handover` | Complete ID check & mark Collected | Operator/Admin |
| `GET` | `/api/admin/analytics` | Fleet metrics, revenue, and SPR ratio | Admin |
| `PATCH`| `/api/admin/orders/:id/status` | Update hardware printing lifecycle status | Operator/Admin |
| `POST` | `/api/support/tickets` | Submit printing problem or refund request | Bearer JWT |

---

## 9. Campus Kiosk Locations (Demonstration Fleet)

1. **Central Campus Kiosk** (`K-CENTRAL`): Student Activity Center, Ground Floor Foyer (45 PPM, High Capacity)
2. **Library Kiosk** (`K-LIB`): Central Library, 2nd Floor Digital Resource Center (35 PPM, Automated Dispenser)
3. **Hostel Block A Kiosk** (`K-HST-A`): Boys Hostel A, Main Lounge Entrance (30 PPM, 24/7 Terminal)
4. **Hostel Block B Kiosk** (`K-HST-B`): Girls Hostel B, Common Recreation Hall (30 PPM, Express Lockers)
5. **Academic Block Kiosk** (`K-ACAD`): Engineering Department, West Wing Level 1 (50 PPM, Heavy-Duty Binder)

---

## 10. Security & Privacy Highlights

- **Zero-Knowledge Document Vault**: Uploaded materials are decrypted only by the local spooler agent and purged immediately upon tray exit.
- **Removable Tracking-Code Margin**: Tear-off 0.5-inch strip prevents kiosk operators from needing to read confidential lab/assignment contents.
- **Sealed Envelopes**: Printed collations are placed inside tamper-evident sealed packaging with barcode matching.
- **Optional Challenge OTP**: For high-value or confidential submissions, operator can trigger a 6-digit SMS OTP challenge prior to physical release.
