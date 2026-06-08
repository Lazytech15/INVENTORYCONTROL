import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { subDays, format } from 'date-fns'

const CAT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#8b5cf6']

function fmt(n) {
  if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `₱${(n / 1000).toFixed(1)}K`
  return `₱${n.toLocaleString()}`
}

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#374151', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  cursor: { fill: 'rgba(0,0,0,0.03)' },
}

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: '18px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
}

export default function Dashboard({ setPage }) {
  const { state } = useApp()
  const { products, movements, alerts, purchaseOrders } = state

  const metrics = useMemo(() => {
    const totalSKUs = products.length
    const totalValue = products.reduce((s, p) => s + p.qty * p.salePrice, 0)
    const lowStock = alerts.length
    const totalQty = products.reduce((s, p) => s + p.qty, 0)
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayMov = movements.filter(m => m.date === today)
    const todayOut = todayMov.filter(m => m.type === 'outbound').reduce((s, m) => s + m.qty, 0)
    return { totalSKUs, totalValue, lowStock, totalQty, todayOut }
  }, [products, movements, alerts])

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
      const day = format(subDays(new Date(), 6 - i), 'EEE')
      const dayMovs = movements.filter(m => m.date === date)
      return {
        day,
        inbound: dayMovs.filter(m => m.type === 'inbound').reduce((s, m) => s + m.qty, 0),
        outbound: dayMovs.filter(m => m.type === 'outbound').reduce((s, m) => s + m.qty, 0),
      }
    })
  }, [movements])

  const categoryData = useMemo(() => {
    const cats = {}
    products.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + p.qty * p.salePrice
    })
    const total = Object.values(cats).reduce((s, v) => s + v, 0)
    return Object.entries(cats).map(([name, val], i) => ({
      name, value: Math.round((val / total) * 100), color: CAT_COLORS[i % CAT_COLORS.length],
    }))
  }, [products])

  const topProducts = useMemo(() =>
    [...products].sort((a, b) => b.qty * b.salePrice - a.qty * a.salePrice).slice(0, 5)
      .map(p => ({ name: p.name.slice(0, 22), value: p.qty * p.salePrice })),
    [products]
  )

  const recentMovements = movements.slice(0, 8)

  const STATUS = {
    critical: { label: 'Critical', bg: '#fef2f2', color: '#991b1b', dot: '#dc2626' },
    low:      { label: 'Low',      bg: '#fffbeb', color: '#92400e', dot: '#d97706' },
    out:      { label: 'Out',      bg: '#f3f4f6', color: '#374151', dot: '#6b7280' },
  }

  const kpis = [
    { val: metrics.totalSKUs, lbl: 'Total SKUs', icon: 'ti-package', iconBg: '#f3f4f6', iconColor: '#374151', sub: `${metrics.totalQty.toLocaleString()} units`, accent: '#6366f1' },
    { val: fmt(metrics.totalValue), lbl: 'Stock value', icon: 'ti-cash', iconBg: '#f0fdf4', iconColor: '#16a34a', sub: 'at sale price', accent: '#10b981' },
    { val: metrics.lowStock, lbl: 'Low stock', icon: 'ti-alert-triangle', iconBg: '#fffbeb', iconColor: '#d97706', sub: 'need reorder', accent: '#f59e0b' },
    { val: metrics.todayOut, lbl: "Today's outbound", icon: 'ti-trending-up', iconBg: '#eff6ff', iconColor: '#2563eb', sub: 'units dispatched', accent: '#3b82f6' },
  ]

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20, background: '#f8f9fb' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Dashboard</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        {alerts.length > 0 && (
          <button onClick={() => setPage('alerts')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(251,191,36,0.2)',
          }}>
            <i className="ti ti-bell-ringing" />
            {alerts.length} low stock alert{alerts.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{
            ...cardStyle,
            boxShadow: i % 2 === 0
              ? '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
              : '0 6px 24px rgba(99,102,241,0.07), 0 2px 8px rgba(0,0,0,0.05)',
            background: i % 2 === 0 ? '#ffffff' : '#fafbff',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${k.icon}`} style={{ color: k.iconColor, fontSize: 17 }} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>{k.lbl}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#d1d5db', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginBottom: 14, letterSpacing: '0.05em' }}>Weekly stock movement</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} barSize={10} barGap={2}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="inbound" fill="#6366f1" radius={[2,2,0,0]} name="Inbound" />
              <Bar dataKey="outbound" fill="#f59e0b" radius={[2,2,0,0]} name="Outbound" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[['#6366f1','Inbound'],['#f59e0b','Outbound']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, background: '#fafbff', boxShadow: '0 6px 24px rgba(99,102,241,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginBottom: 14, letterSpacing: '0.05em' }}>Value by category</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PieChart width={100} height={100}>
              <Pie data={categoryData} cx={50} cy={50} innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={0}>
                {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {categoryData.map(c => (
                <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    {c.name}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6b7280' }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Top products by value</div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={topProducts} layout="vertical" barSize={8}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} width={130} />
              <Tooltip formatter={v => [`₱${v.toLocaleString()}`, 'Value']} {...tooltipStyle} />
              <Bar dataKey="value" fill="#6366f1" radius={[0,2,2,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...cardStyle, background: '#fafbff', boxShadow: '0 6px 24px rgba(99,102,241,0.07), 0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>Recent movements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
            {recentMovements.map((m, i) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 8px', borderRadius: 8,
                background: i % 2 === 0 ? '#fff' : '#f3f6ff',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: m.type === 'inbound' ? '#f0fdf4' : '#fffbeb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`ti ${m.type === 'inbound' ? 'ti-arrow-down' : 'ti-arrow-up'}`}
                    style={{ fontSize: 11, color: m.type === 'inbound' ? '#16a34a' : '#d97706' }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.productName}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#d1d5db' }}>{m.date}</div>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500, color: m.type === 'inbound' ? '#16a34a' : '#d97706' }}>
                  {m.type === 'inbound' ? '+' : '-'}{m.qty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock table */}
      {alerts.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', letterSpacing: '0.05em' }}>Low stock — priority reorder</span>
            <button onClick={() => setPage('alerts')} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                {['SKU','Product','Qty','Reorder pt.','Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 20px', fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 5).map((a, i) => {
                const st = STATUS[a.severity] || STATUS.low
                return (
                  <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbff', borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af' }}>{a.sku}</td>
                    <td style={{ padding: '10px 20px', fontSize: 13, color: '#111827' }}>{a.name}</td>
                    <td style={{ padding: '10px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: '#dc2626' }}>{a.qty}</td>
                    <td style={{ padding: '10px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9ca3af' }}>{a.reorderAt}</td>
                    <td style={{ padding: '10px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: st.bg, color: st.color }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot }} />
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}