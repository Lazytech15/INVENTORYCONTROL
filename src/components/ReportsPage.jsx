import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { subDays, format } from 'date-fns'

const CAT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#8b5cf6']

function fmt(n) {
  if (n >= 1000000) return `₱${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `₱${(n / 1000).toFixed(1)}K`
  return `₱${n.toLocaleString()}`
}

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#374151', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  cursor: { fill: 'rgba(0,0,0,0.03)' },
}

export default function ReportsPage() {
  const { state } = useApp()
  const { products, movements } = state
  const [range, setRange] = useState(30)

  const rangeStart = format(subDays(new Date(), range - 1), 'yyyy-MM-dd')

  const rangeMovements = useMemo(() =>
    movements.filter(m => m.date >= rangeStart),
    [movements, rangeStart]
  )

  const trendData = useMemo(() => {
    return Array.from({ length: Math.min(range, 14) }, (_, i) => {
      const date = format(subDays(new Date(), Math.min(range, 14) - 1 - i), 'yyyy-MM-dd')
      const day = format(subDays(new Date(), Math.min(range, 14) - 1 - i), 'MM/dd')
      const dayMovs = movements.filter(m => m.date === date)
      return {
        day,
        inbound: dayMovs.filter(m => m.type === 'inbound').reduce((s, m) => s + m.qty, 0),
        outbound: dayMovs.filter(m => m.type === 'outbound').reduce((s, m) => s + m.qty, 0),
      }
    })
  }, [movements, range])

  const topMoving = useMemo(() => {
    const map = {}
    rangeMovements.filter(m => m.type === 'outbound').forEach(m => {
      map[m.productName] = (map[m.productName] || 0) + m.qty
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, qty]) => ({ name: name.slice(0, 22), qty }))
  }, [rangeMovements])

  const categoryValue = useMemo(() => {
    const cats = {}
    products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + p.qty * p.salePrice })
    return Object.entries(cats).map(([name, value], i) => ({ name, value, color: CAT_COLORS[i % CAT_COLORS.length] }))
  }, [products])

  const totalIn = rangeMovements.filter(m => m.type === 'inbound').reduce((s, m) => s + m.qty, 0)
  const totalOut = rangeMovements.filter(m => m.type === 'outbound').reduce((s, m) => s + m.qty, 0)
  const totalStockValue = products.reduce((s, p) => s + p.qty * p.salePrice, 0)
  const totalCostValue = products.reduce((s, p) => s + p.qty * p.costPrice, 0)
  const margin = totalStockValue - totalCostValue

  function exportReport() {
    const lines = [
      `STOCKMASTER PRO — INVENTORY REPORT`,
      `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
      `Period: Last ${range} days`,
      '',
      '=== SUMMARY ===',
      `Total Stock Value (Sale): ₱${totalStockValue.toLocaleString()}`,
      `Total Stock Value (Cost): ₱${totalCostValue.toLocaleString()}`,
      `Gross Margin Potential:  ₱${margin.toLocaleString()}`,
      `Units Received:          ${totalIn}`,
      `Units Dispatched:        ${totalOut}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const cardStyle = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fb' }}>
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Reports</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Inventory analytics & summaries</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setRange(d)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                background: range === d ? '#f3f4f6' : 'transparent',
                color: range === d ? '#111827' : '#6b7280',
                border: range === d ? '1px solid #e5e7eb' : '1px solid transparent',
                fontWeight: range === d ? 500 : 400,
              }}
            >
              {d}d
            </button>
          ))}
        </div>
        <button
          onClick={exportReport}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer' }}
        >
          <i className="ti ti-download" style={{ fontSize: 15 }} /> Export
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { val: fmt(totalStockValue), lbl: 'Stock value (sale)', icon: 'ti-coin', bg: '#eff6ff', ic: '#2563eb' },
            { val: fmt(totalCostValue), lbl: 'Stock value (cost)', icon: 'ti-cash', bg: '#f0fdf4', ic: '#16a34a' },
            { val: fmt(margin), lbl: 'Margin potential', icon: 'ti-trending-up', bg: '#f0fdf4', ic: '#16a34a' },
            { val: `${totalIn} / ${totalOut}`, lbl: `In / out (${range}d)`, icon: 'ti-arrows-exchange', bg: '#fffbeb', ic: '#d97706' },
          ].map((k, i) => (
            <div key={i} style={{
              ...cardStyle,
              background: i % 2 === 0 ? '#ffffff' : '#fafbff',
              boxShadow: i % 2 === 0
                ? '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
                : '0 6px 24px rgba(99,102,241,0.07), 0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <i className={`ti ${k.icon}`} style={{ color: k.ic, fontSize: 16 }} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#111827', lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>{k.lbl}</div>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div style={cardStyle}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
            Daily movement trend (last {Math.min(range, 14)} days)
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="inbound" stroke="#6366f1" strokeWidth={2} dot={false} name="Inbound" />
              <Line type="monotone" dataKey="outbound" stroke="#f59e0b" strokeWidth={2} dot={false} name="Outbound" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[['#6366f1', 'Inbound'], ['#f59e0b', 'Outbound']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 2, background: c, display: 'inline-block', borderRadius: 1 }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Top moving */}
          <div style={cardStyle}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
              Top moving products (outbound, {range}d)
            </div>
            {topMoving.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topMoving} layout="vertical" barSize={8}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip formatter={v => [v, 'Units']} {...tooltipStyle} />
                  <Bar dataKey="qty" fill="#6366f1" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 100, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#d1d5db' }}>
                No data for period
              </div>
            )}
          </div>

          {/* Category value */}
          <div style={cardStyle}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
              Stock value by category
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <PieChart width={110} height={110}>
                <Pie data={categoryValue} cx={55} cy={55} innerRadius={32} outerRadius={50} dataKey="value" strokeWidth={0}>
                  {categoryValue.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categoryValue.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b7280' }}>{c.name}</span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#374151', fontWeight: 500 }}>{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full inventory table */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af' }}>
            Full inventory snapshot
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['SKU', 'Product', 'Category', 'Qty', 'Cost', 'Sale', 'Stock value', 'Margin'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '9px 16px', fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...products].sort((a, b) => (b.qty * b.salePrice) - (a.qty * a.salePrice)).map((p, i) => {
                  const val = p.qty * p.salePrice
                  const cost = p.qty * p.costPrice
                  const mgn = val - cost
                  const isEven = i % 2 === 0
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', background: isEven ? '#fff' : '#fafbff' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                      onMouseLeave={e => e.currentTarget.style.background = isEven ? '#fff' : '#fafbff'}
                    >
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af' }}>{p.sku}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#111827' }}>{p.name}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#6b7280' }}>{p.category}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#111827' }}>{p.qty}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9ca3af' }}>₱{p.costPrice.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9ca3af' }}>₱{p.salePrice.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500, color: '#374151' }}>₱{val.toLocaleString()}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 500, color: mgn > 0 ? '#16a34a' : '#dc2626' }}>₱{mgn.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}