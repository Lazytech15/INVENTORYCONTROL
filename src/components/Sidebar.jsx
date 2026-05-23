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

const ROLE_COLOR = {
  admin:   '#6090ff',
  manager: '#4ade80',
  staff:   '#f8c94e',
}

export default function Sidebar({ page, setPage }) {
  const { state, dispatch } = useApp()
  const { user, alerts } = state
  const [collapsed, setCollapsed] = useState(false)

  const W = collapsed ? 76 : 270

  return (
    <aside
      style={{
        width: W,
        minWidth: W,
        height: '100%',
        background: '#0b0b17',
        borderRight: '1px solid #1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >

      {/* ── Logo header ── */}
      <div style={{
        padding: collapsed ? '16px 0' : '16px 18px',
        borderBottom: '1px solid #1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 10,
        minHeight: 80,
        transition: 'padding 0.28s ease',
      }}>
        {collapsed ? (
          /* Collapsed: icon only */
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #0d1a3a, #1a2a5e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <i className="ti ti-package" style={{ color: '#4a8fff', fontSize: 22 }} />
          </div>
        ) : (
          /* Expanded: full logo centered */
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <img
              src={logo}
              alt="Inventory Control"
              style={{ width: '90%', height: 'auto', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Collapse toggle */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#3a3a5a', padding: 6, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6090ff'; e.currentTarget.style.background = '#1a1a2e' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#3a3a5a'; e.currentTarget.style.background = 'none' }}
          >
            <i className="ti ti-layout-sidebar-left-collapse" style={{ fontSize: 22 }} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#3a3a5a', padding: '10px 0', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: '1px solid #1a1a2e',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#6090ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#3a3a5a'}
        >
          <i className="ti ti-layout-sidebar-left-expand" style={{ fontSize: 22 }} />
        </button>
      )}

      {/* ── Nav ── */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {!collapsed && (
          <div style={{
            padding: '2px 10px 10px',
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            color: '#2a2a45',
            letterSpacing: '0.14em',
          }}>
            NAVIGATION
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
                gap: 14,
                padding: collapsed ? '14px 0' : '13px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.15s, color 0.15s',
                background: active
                  ? 'linear-gradient(90deg, #1a2a5e 0%, #141428 100%)'
                  : 'transparent',
                color: active ? '#7aabff' : '#4a4a6a',
                boxShadow: active ? 'inset 3px 0 0 #1a4fff' : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#12122a'; e.currentTarget.style.color = '#8080b0' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a4a6a' } }}
            >
              <i
                className={`ti ${item.icon}`}
                style={{
                  fontSize: 22,
                  flexShrink: 0,
                  color: active ? '#6090ff' : 'inherit',
                  filter: active ? 'drop-shadow(0 0 6px rgba(96,144,255,0.5))' : 'none',
                  transition: 'filter 0.2s',
                }}
              />

              {!collapsed && (
                <span style={{ fontSize: 15, fontWeight: active ? 600 : 400, flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
              )}

              {item.badge && alerts.length > 0 && (
                <span style={{
                  background: '#ff4f1a',
                  color: '#fff',
                  fontSize: collapsed ? 9 : 11,
                  fontWeight: 700,
                  borderRadius: 999,
                  padding: collapsed ? '1px 4px' : '2px 8px',
                  minWidth: collapsed ? 16 : 20,
                  textAlign: 'center',
                  lineHeight: 1.4,
                  position: collapsed ? 'absolute' : 'static',
                  top: collapsed ? 8 : 'auto',
                  right: collapsed ? 8 : 'auto',
                }}>
                  {alerts.length}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── User footer ── */}
      <div style={{
        borderTop: '1px solid #1a1a2e',
        padding: collapsed ? '16px 0' : '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: collapsed ? 'center' : 'stretch',
        gap: 12,
      }}>
        {/* Avatar + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{
            width: 42, height: 42,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #1a2a5e, #0d1a3a)',
            border: `2px solid ${ROLE_COLOR[user?.role] || '#3a3a5a'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 15,
            color: ROLE_COLOR[user?.role] || '#9090b0',
            boxShadow: `0 0 14px ${ROLE_COLOR[user?.role]}33`,
          }}>
            {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: '#dde0f0',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name}
              </div>
              <div style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                color: ROLE_COLOR[user?.role],
                letterSpacing: '0.1em',
                marginTop: 3,
              }}>
                {user?.role?.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={() => dispatch({ type: 'LOGOUT' })}
          title={collapsed ? 'Sign Out' : undefined}
          style={{
            background: '#12122a',
            border: '1px solid #1e1e35',
            borderRadius: 10,
            color: '#4a4a6a',
            cursor: 'pointer',
            fontSize: 14,
            padding: collapsed ? '10px 0' : '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            width: collapsed ? 46 : '100%',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#2d0f0f'
            e.currentTarget.style.color = '#f87171'
            e.currentTarget.style.borderColor = '#4a1a1a'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#12122a'
            e.currentTarget.style.color = '#4a4a6a'
            e.currentTarget.style.borderColor = '#1e1e35'
          }}
        >
          <i className="ti ti-logout" style={{ fontSize: 20, flexShrink: 0 }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

    </aside>
  )
}