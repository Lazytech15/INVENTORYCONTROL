import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext.jsx'
import LandingPage from './components/LandingPage.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import InventoryPage from './components/InventoryPage.jsx'
import MovementsPage from './components/MovementsPage.jsx'
import PurchaseOrdersPage from './components/Purchaseorderpages.jsx'
import ReportsPage from './components/ReportsPage.jsx'
import AlertsPage from './components/AlertsPage.jsx'
import UsersPage from './components/UsersPage.jsx'

// ─── Inner app (needs AppContext) ─────────────────────────────────────────────
function AppShell() {
  const { state } = useApp()
  const { user } = state
  const [page, setPage] = useState('dashboard')

  // Not logged in → show landing page (with login modal inside)
  if (!user) return <LandingPage />

  // Page map
  const PAGES = {
    dashboard: <Dashboard setPage={setPage} />,
    inventory: <InventoryPage />,
    movements: <MovementsPage />,
    orders:    <PurchaseOrdersPage />,
    reports:   <ReportsPage />,
    alerts:    <AlertsPage setPage={setPage} />,
    users:     <UsersPage />,
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} />
      <main className="app-main">
        {PAGES[page] ?? PAGES.dashboard}
      </main>
    </div>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
