import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import logo from '../../public/inventorycontrol_logo.png'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',      icon: 'ti-layout-dashboard', roles: ['admin','manager','staff'] },
  { id: 'inventory', label: 'Inventory',       icon: 'ti-package',          roles: ['admin','manager','staff'] },
  { id: 'movements', label: 'Stock Movements', icon: 'ti-arrows-exchange',  roles: ['admin','manager','staff'] },
  { id: 'orders',    label: 'Purchase Orders', icon: 'ti-clipboard-list',   roles: ['admin','manager'] },
  { id: 'reports',   label: 'Reports',         icon: 'ti-chart-bar',        roles: ['admin','manager'] },
  { id: 'alerts',    label: 'Alerts',          icon: 'ti-bell',             roles: ['admin','manager','staff'], badge: true },
  { id: 'users',     label: 'Users',           icon: 'ti-users',            roles: ['admin'] },
]

const ROLE_STYLES = {
  admin:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  manager: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  staff:   { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
}

export default function Sidebar({ page, setPage }) {
  const { state, dispatch } = useApp()
  const { user, alerts } = state
  const [collapsed, setCollapsed] = useState(false)

  const W = collapsed ? 64 : 240

  const rs = ROLE_STYLES[user?.role] || ROLE_STYLES.staff

  return (
    <aside
      style={{
        width: W, minWidth: W,
        height: '100%',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo header */}
      <div style={{
        padding: collapsed ? '16px 0' : '16px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8,
        minHeight: 64,
      }}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ height: 100, width: 'auto', objectFit: 'contain' }}
            />
          </button>
        ) : (
          <>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={logo}
                alt="Logo"
                style={{ height: 100, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
              />
            </div>
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#d1d5db', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = '#f3f4f6' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.background = 'none' }}
            >
              <i className="ti ti-layout-sidebar-left-collapse" style={{ fontSize: 18 }} />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        padding: '10px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {!collapsed && (
          <div style={{
            padding: '2px 8px 8px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#d1d5db',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Menu
          </div>
        )}

        {NAV.filter(n => n.roles.includes(user?.role)).map(item => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.12s, color 0.12s',
                background: active ? '#f3f4f6' : 'transparent',
                color: active ? '#111827' : '#6b7280',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' } }}
            >
              <i
                className={`ti ${item.icon}`}
                style={{
                  fontSize: 18,
                  flexShrink: 0,
                  color: active ? '#111827' : 'inherit',
                }}
              />

              {!collapsed && (
                <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
              )}

              {item.badge && alerts.length > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  borderRadius: 999,
                  padding: collapsed ? '1px 4px' : '1px 6px',
                  minWidth: 16,
                  textAlign: 'center',
                  lineHeight: 1.5,
                  position: collapsed ? 'absolute' : 'static',
                  top: collapsed ? 6 : 'auto',
                  right: collapsed ? 6 : 'auto',
                }}>
                  {alerts.length}
                </span>
              )}

              {active && !collapsed && (
                <div style={{
                  position: 'absolute',
                  left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 16,
                  background: '#111827',
                  borderRadius: '0 2px 2px 0',
                }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: collapsed ? 'center' : 'stretch',
        gap: 10,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: '50%',
              flexShrink: 0,
              background: rs.bg,
              border: `1px solid ${rs.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: rs.color,
            }}>
              {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 500,
                color: '#111827',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                color: rs.color,
                marginTop: 2,
              }}>
                {user?.role?.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: rs.bg, border: `1px solid ${rs.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: rs.color,
          }}>
            {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        )}

        <button
          onClick={() => dispatch({ type: 'LOGOUT' })}
          title={collapsed ? 'Sign Out' : undefined}
          style={{
            background: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: 13,
            padding: collapsed ? '8px 0' : '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            width: collapsed ? 40 : '100%',
            transition: 'background 0.12s, color 0.12s, border-color 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fecaca' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = '#e5e7eb' }}
        >
          <i className="ti ti-logout" style={{ fontSize: 16, flexShrink: 0 }} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}