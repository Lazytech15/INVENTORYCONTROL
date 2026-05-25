# Inventory Control

A full-featured **Inventory Control System** built as a single-page React application. Designed to simulate real-world stock management workflows — from tracking product levels and recording stock movements to managing purchase orders and generating reports. All data is mock/demo data for portfolio purposes.

---

## Screenshots

### Login
<img width="1917" height="948" alt="Screenshot 2026-05-25 103441" src="https://github.com/user-attachments/assets/c6f5c4be-c255-48a4-af31-5b625cb33323" />

### Dashboard Overview
<img width="1919" height="948" alt="Screenshot 2026-05-25 103611" src="https://github.com/user-attachments/assets/aea86054-6f0e-4bd2-be65-014c850214a9" />


---

## Features

- **Role-Based Authentication** — Three user roles (Admin, Manager, Staff) with a mock login system. Each role has different levels of access across the app.
- **Dashboard** — At-a-glance summary of stock health, recent activity, low-stock alerts, and key inventory metrics with charts.
- **Inventory Management** — Full product catalog with SKU tracking, category filtering, cost/sale price, reorder thresholds, supplier assignment, and barcode support. Supports adding, editing, and deleting products.
- **Stock Movements** — Logs all inbound and outbound stock transactions with timestamps, notes, and user attribution. Pre-seeded with 30 days of simulated movement history.
- **Purchase Orders** — Create and manage POs against suppliers. Marking a PO as delivered automatically updates stock quantities and logs the movements.
- **Alerts** — Automatically flags products that fall at or below their reorder threshold. Severity levels include Low Stock, Critical, and Out of Stock.
- **Reports** — Visual summaries of inventory value, movement trends, and category breakdowns powered by Recharts.
- **User Management** — Admin-only view to manage system users and roles.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Date Utilities | date-fns |
| State Management | React Context + useReducer |
| Persistence | localStorage |

---

## Project Structure

```
src/
├── App.jsx                   # Root shell & page routing
├── main.jsx                  # Entry point
├── index.css                 # Global styles (Tailwind)
├── context/
│   └── AppContext.jsx        # Global state, reducer, actions
├── data/
│   └── seed.js               # Mock products, suppliers, users, POs
└── components/
    ├── LoginPage.jsx
    ├── Sidebar.jsx
    ├── Dashboard.jsx
    ├── InventoryPage.jsx
    ├── MovementsPage.jsx
    ├── Purchaseorderpages.jsx
    ├── ReportsPage.jsx
    ├── AlertsPage.jsx
    └── UsersPage.jsx
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Lazytech15/INVENTORYCONTROL.git
cd sample

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Demo Credentials

All accounts use mock data. No real authentication is in place.

| Role | Email | Password |
|---|---|---|
| Admin | admin@stockmaster.ph | admin123 |
| Manager | manager@stockmaster.ph | manager123 |
| Staff | staff@stockmaster.ph | staff123 |

---

## Notes

- All product, supplier, movement, and order data is **mock/seeded data** for demonstration purposes only.
- State is persisted to `localStorage`, so changes made during a session survive page refreshes.
- The app is fully client-side — no backend or database is required.
