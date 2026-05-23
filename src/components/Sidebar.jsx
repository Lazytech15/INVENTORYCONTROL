import { useApp } from '../context/AppContext.jsx'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',       icon: 'ti-layout-dashboard', roles: ['admin','manager','staff'] },
  { id: 'inventory',  label: 'Inventory',        icon: 'ti-package',          roles: ['admin','manager','staff'] },
  { id: 'movements',  label: 'Stock Movements',  icon: 'ti-arrows-exchange',  roles: ['admin','manager','staff'] },
  { id: 'orders',     label: 'Purchase Orders',  icon: 'ti-clipboard-list',   roles: ['admin','manager'] },
  { id: 'reports',    label: 'Reports',          icon: 'ti-chart-bar',        roles: ['admin','manager'] },
  { id: 'alerts',     label: 'Alerts',           icon: 'ti-bell',             roles: ['admin','manager','staff'], badge: true },
  { id: 'users',      label: 'Users',            icon: 'ti-users',            roles: ['admin'] },
]

export default function Sidebar({ page, setPage }) {
  const { state, dispatch } = useApp()
  const { user, alerts } = state

  return (
    <aside className="flex flex-col h-full" style={{ width: 220, background: '#0f0f1a', borderRight: '1px solid #1e1e30' }}>
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #1e1e30' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1a4fff' }}>
            <i className="ti ti-package text-white" style={{ fontSize: 16 }} />
          </div>
          <div>
            <div className="font-syne text-sm font-extrabold leading-none text-white">
              Stock<span style={{ color: '#1a4fff' }}>Master</span>
            </div>
            <div className="font-mono text-[9px] mt-0.5" style={{ color: '#3a3a5a', letterSpacing: '0.1em' }}>PRO v2.0</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.filter(n => n.roles.includes(user?.role)).map(item => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left"
              style={{
                background: active ? '#1a1a2e' : 'transparent',
                color: active ? '#6090ff' : '#5a5a7a',
                borderLeft: active ? '2px solid #1a4fff' : '2px solid transparent',
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: 16, width: 18, textAlign: 'center' }} />
              <span>{item.label}</span>
              {item.badge && alerts.length > 0 && (
                <span
                  className="ml-auto text-[9px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
                  style={{ background: '#ff4f1a', color: '#fff' }}
                >
                  {alerts.length}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid #1e1e30' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
            style={{ background: '#1a2a5e', color: '#6090ff' }}
          >
            {user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div
              className="font-mono text-[9px]"
              style={{
                color: user?.role === 'admin' ? '#6090ff' : user?.role === 'manager' ? '#4ade80' : '#f8c94e',
                letterSpacing: '0.08em',
              }}
            >
              {user?.role?.toUpperCase()}
            </div>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'LOGOUT' })}
          className="w-full text-xs rounded-lg py-2 transition-colors hover:opacity-80"
          style={{ background: '#1a1a2e', color: '#5a5a7a', border: '1px solid #2a2a3e' }}
        >
          <i className="ti ti-logout mr-1.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}