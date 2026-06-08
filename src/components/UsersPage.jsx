import { useApp } from '../context/AppContext.jsx'

const ROLE_STYLES = {
  admin:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Admin' },
  manager: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Manager' },
  staff:   { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Staff' },
}

const PERMISSIONS = {
  admin:   ['View Dashboard', 'Manage Inventory', 'Stock Adjustments', 'Purchase Orders', 'Reports', 'Manage Users', 'Delete Products'],
  manager: ['View Dashboard', 'Manage Inventory', 'Stock Adjustments', 'Purchase Orders', 'Reports'],
  staff:   ['View Dashboard', 'View Inventory', 'Stock Adjustments', 'View Alerts'],
}

const ALL_PERMISSIONS = ['View Dashboard', 'Manage Inventory', 'Stock Adjustments', 'Purchase Orders', 'Reports', 'Manage Users', 'Delete Products']

export default function UsersPage() {
  const { USERS, state } = useApp()
  const { user: currentUser } = state

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fb' }}>
      <div style={{ padding: '16px 24px', flexShrink: 0, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Users & Roles</h1>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{USERS.length} system users</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {USERS.map((u, idx) => {
          const rs = ROLE_STYLES[u.role]
          const perms = PERMISSIONS[u.role]
          const isCurrent = u.id === currentUser?.id
          const isEven = idx % 2 === 0

          return (
            <div
              key={u.id}
              style={{
                background: isEven ? '#ffffff' : '#fafbff',
                border: `1px solid ${isCurrent ? '#bfdbfe' : '#e5e7eb'}`,
                borderRadius: 14, padding: '20px',
                boxShadow: isEven
                  ? '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
                  : '0 6px 24px rgba(99,102,241,0.07), 0 2px 8px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = isEven
                  ? '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
                  : '0 6px 24px rgba(99,102,241,0.07), 0 2px 8px rgba(0,0,0,0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: rs.bg, border: `1px solid ${rs.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 600, color: rs.color,
                  }}>
                    {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{u.name}</span>
                      {isCurrent && (
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#eff6ff', color: '#1d4ed8' }}>you</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{u.email}</div>
                  </div>
                </div>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500,
                  padding: '4px 10px', borderRadius: 6,
                  background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
                }}>
                  {rs.label}
                </span>
              </div>

              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Permissions</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ALL_PERMISSIONS.map(p => {
                    const has = perms.includes(p)
                    return (
                      <span
                        key={p}
                        style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                          padding: '4px 10px', borderRadius: 6,
                          background: has ? '#f9fafb' : 'transparent',
                          color: has ? '#374151' : '#d1d5db',
                          border: `1px solid ${has ? '#e5e7eb' : '#f3f4f6'}`,
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        <i className={`ti ${has ? 'ti-check' : 'ti-x'}`} style={{ fontSize: 11, color: has ? '#16a34a' : '#d1d5db' }} />
                        {p}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}