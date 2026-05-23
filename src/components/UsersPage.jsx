import { useApp } from '../context/AppContext.jsx'

const ROLE_STYLES = {
  admin:   { bg: '#1a2a5e', color: '#6090ff', label: 'Admin' },
  manager: { bg: '#0d2a1a', color: '#4ade80', label: 'Manager' },
  staff:   { bg: '#2a2a0d', color: '#f8c94e', label: 'Staff' },
}

const PERMISSIONS = {
  admin:   ['View Dashboard', 'Manage Inventory', 'Stock Adjustments', 'Purchase Orders', 'Reports', 'Manage Users', 'Delete Products'],
  manager: ['View Dashboard', 'Manage Inventory', 'Stock Adjustments', 'Purchase Orders', 'Reports'],
  staff:   ['View Dashboard', 'View Inventory', 'Stock Adjustments', 'View Alerts'],
}

export default function UsersPage() {
  const { USERS, state } = useApp()
  const { user: currentUser } = state

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e30' }}>
        <h1 className="font-syne font-extrabold text-lg text-white">Users & Roles</h1>
        <p className="font-mono text-[10px] mt-0.5" style={{ color: '#5a5a7a' }}>{USERS.length} system users</p>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {USERS.map(u => {
          const rs = ROLE_STYLES[u.role]
          const perms = PERMISSIONS[u.role]
          const isCurrent = u.id === currentUser?.id

          return (
            <div
              key={u.id}
              className="rounded-xl border p-5"
              style={{
                background: isCurrent ? '#13131f' : '#13131f',
                borderColor: isCurrent ? '#2a3a7e' : '#2a2a3e',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: rs.bg, color: rs.color }}
                  >
                    {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: '#e2e2f0' }}>{u.name}</span>
                      {isCurrent && (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full" style={{ background: '#1a2a5e', color: '#6090ff' }}>YOU</span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#5a5a7a' }}>{u.email}</div>
                  </div>
                </div>
                <span
                  className="font-mono text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{ background: rs.bg, color: rs.color }}
                >
                  {rs.label.toUpperCase()}
                </span>
              </div>

              <div>
                <div className="font-mono text-[9px] mb-2" style={{ color: '#5a5a7a', letterSpacing: '0.1em' }}>PERMISSIONS</div>
                <div className="flex flex-wrap gap-1.5">
                  {perms.map(p => (
                    <span
                      key={p}
                      className="font-mono text-[9px] px-2.5 py-1 rounded-md"
                      style={{ background: '#1a1a2e', color: '#6a6a8a', border: '1px solid #2a2a3e' }}
                    >
                      <i className="ti ti-check mr-1" style={{ color: '#4ade80', fontSize: 10 }} />
                      {p}
                    </span>
                  ))}
                  {/* Show denied perms for lower roles */}
                  {u.role !== 'admin' && PERMISSIONS.admin.filter(p => !perms.includes(p)).map(p => (
                    <span
                      key={p}
                      className="font-mono text-[9px] px-2.5 py-1 rounded-md"
                      style={{ background: '#1a1a1a', color: '#3a3a4a', border: '1px solid #1e1e28' }}
                    >
                      <i className="ti ti-minus mr-1" style={{ color: '#3a3a5a', fontSize: 10 }} />
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {/* Role comparison table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <div className="px-5 py-3 font-mono text-[10px]" style={{ color: '#5a5a7a', letterSpacing: '0.08em', borderBottom: '1px solid #2a2a3e' }}>
            ROLE PERMISSION MATRIX
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                <th className="text-left px-5 py-3 font-mono text-[9px]" style={{ color: '#5a5a7a', letterSpacing: '0.08em', fontWeight: 400 }}>PERMISSION</th>
                {['admin','manager','staff'].map(r => (
                  <th key={r} className="text-center px-4 py-3 font-mono text-[9px]" style={{ color: ROLE_STYLES[r].color, letterSpacing: '0.08em', fontWeight: 600 }}>
                    {r.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.admin.map(perm => (
                <tr key={perm} style={{ borderBottom: '1px solid #1a1a28' }}>
                  <td className="px-5 py-2.5 text-xs" style={{ color: '#9090b8' }}>{perm}</td>
                  {['admin','manager','staff'].map(r => (
                    <td key={r} className="px-4 py-2.5 text-center">
                      {PERMISSIONS[r].includes(perm)
                        ? <i className="ti ti-check" style={{ color: '#4ade80', fontSize: 14 }} />
                        : <i className="ti ti-minus" style={{ color: '#2a2a3a', fontSize: 14 }} />
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}