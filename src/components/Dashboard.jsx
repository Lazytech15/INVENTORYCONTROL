import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { subDays, format } from 'date-fns'

const COLORS = ['#3a5aff', '#ff6b4a', '#4ade80', '#f8c94e', '#c084fc', '#38bdf8']

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

  // Weekly movement
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

  // Category breakdown
  const categoryData = useMemo(() => {
    const cats = {}
    products.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + p.qty * p.salePrice
    })
    const total = Object.values(cats).reduce((s, v) => s + v, 0)
    return Object.entries(cats).map(([name, val], i) => ({
      name,
      value: Math.round((val / total) * 100),
      color: COLORS[i % COLORS.length],
    }))
  }, [products])

  // Top products by value
  const topProducts = useMemo(() =>
    [...products]
      .sort((a, b) => b.qty * b.salePrice - a.qty * a.salePrice)
      .slice(0, 5)
      .map(p => ({ name: p.name.slice(0, 20), value: p.qty * p.salePrice })),
    [products]
  )

  const STATUS = {
    critical: { label: 'CRITICAL', bg: '#2d0f0f', color: '#f87171' },
    low:      { label: 'LOW',      bg: '#3a1a0d', color: '#fb923c' },
    out:      { label: 'OUT',      bg: '#1a0d2e', color: '#c084fc' },
    ok:       { label: 'HEALTHY',  bg: '#0d3320', color: '#4ade80' },
  }

  function fmt(n) {
    if (n >= 1000000) return `₱${(n/1000000).toFixed(1)}M`
    if (n >= 1000) return `₱${(n/1000).toFixed(1)}K`
    return `₱${n.toLocaleString()}`
  }

  const recentMovements = movements.slice(0, 8)

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-extrabold text-xl text-white">Dashboard</h1>
          <p className="font-mono text-xs mt-0.5" style={{ color: '#5a5a7a' }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')} — Real-time overview
          </p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={() => setPage('alerts')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium animate-pulse-slow"
            style={{ background: '#2d1a0d', color: '#fb923c', border: '1px solid #4a2a0d' }}
          >
            <i className="ti ti-bell-ringing" />
            {alerts.length} low stock alert{alerts.length > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { val: metrics.totalSKUs.toLocaleString(), lbl: 'TOTAL SKUs',     icon: 'ti-package',      color: '#3a5aff', sub: `${metrics.totalQty} total units` },
          { val: fmt(metrics.totalValue),            lbl: 'STOCK VALUE',    icon: 'ti-cash',         color: '#4ade80', sub: 'at sale price'   },
          { val: metrics.lowStock,                   lbl: 'LOW STOCK',      icon: 'ti-alert-triangle',color: '#fb923c', sub: 'need reorder'    },
          { val: metrics.todayOut,                   lbl: "TODAY'S OUTBOUND",icon: 'ti-trending-up', color: '#c084fc', sub: 'units dispatched' },
        ].map((k, i) => (
          <div
            key={i}
            className="rounded-xl p-4 border"
            style={{ background: '#13131f', borderColor: '#2a2a3e' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${k.color}18` }}
              >
                <i className={`ti ${k.icon}`} style={{ color: k.color, fontSize: 18 }} />
              </div>
            </div>
            <div className="font-syne font-extrabold text-2xl text-white leading-none">{k.val}</div>
            <div className="font-mono text-[10px] mt-1" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>{k.lbl}</div>
            <div className="text-xs mt-1" style={{ color: '#3a3a5a' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Weekly bar chart */}
        <div className="col-span-2 rounded-xl border p-4" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <div className="font-mono text-[10px] mb-3" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>WEEKLY STOCK MOVEMENT (UNITS)</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData} barSize={10} barGap={2}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#5a5a7a', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#111128', border: '1px solid #2e2e50', borderRadius: 8, fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#e0e0f8' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="inbound" fill="#3a5aff" radius={[2,2,0,0]} name="Inbound" />
              <Bar dataKey="outbound" fill="#ff6b4a" radius={[2,2,0,0]} name="Outbound" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[['#3a5aff','INBOUND'],['#ff6b4a','OUTBOUND']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span className="font-mono text-[9px]" style={{ color: '#5a5a7a' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category pie */}
        <div className="rounded-xl border p-4" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <div className="font-mono text-[10px] mb-3" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>STOCK VALUE BY CATEGORY</div>
          <div className="flex flex-col items-center">
            <PieChart width={100} height={100}>
              <Pie data={categoryData} cx={50} cy={50} innerRadius={30} outerRadius={46} dataKey="value" strokeWidth={0}>
                {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div className="w-full mt-2 space-y-1">
              {categoryData.map(c => (
                <div key={c.name} className="flex justify-between items-center text-[9px] font-mono" style={{ color: '#6a6a8a' }}>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top products */}
        <div className="rounded-xl border p-4" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <div className="font-mono text-[10px] mb-3" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>TOP PRODUCTS BY VALUE</div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={topProducts} layout="vertical" barSize={8}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6a6a8a', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip formatter={v => [`₱${v.toLocaleString()}`, 'Value']} contentStyle={{ background: '#111128', border: '1px solid #2e2e50', borderRadius: 8, fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#e0e0f8' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" fill="#3a5aff" radius={[0,2,2,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent movements */}
        <div className="rounded-xl border p-4" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <div className="font-mono text-[10px] mb-3" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>RECENT MOVEMENTS</div>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 160 }}>
            {recentMovements.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-xs">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: m.type === 'inbound' ? '#0d3320' : '#2d1a0d' }}
                >
                  <i
                    className={`ti ${m.type === 'inbound' ? 'ti-arrow-down' : 'ti-arrow-up'}`}
                    style={{ fontSize: 10, color: m.type === 'inbound' ? '#4ade80' : '#fb923c' }}
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: '#c0c0e0' }}>{m.productName}</div>
                  <div className="font-mono text-[9px]" style={{ color: '#5a5a7a' }}>{m.date}</div>
                </div>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: m.type === 'inbound' ? '#4ade80' : '#fb923c' }}
                >
                  {m.type === 'inbound' ? '+' : '-'}{m.qty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock table */}
      {alerts.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #2a2a3e' }}>
            <span className="font-mono text-[10px]" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>LOW STOCK — PRIORITY REORDER</span>
            <button onClick={() => setPage('alerts')} className="font-mono text-[10px] hover:opacity-80" style={{ color: '#1a4fff' }}>View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e30' }}>
                  {['SKU','PRODUCT','QTY','REORDER PT.','STATUS'].map(h => (
                    <th key={h} className="text-left px-4 py-2 font-mono text-[9px]" style={{ color: '#5a5a7a', letterSpacing: '0.08em', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 5).map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #1a1a28' }}>
                    <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{a.sku}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: '#c0c0e0' }}>{a.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs font-bold" style={{ color: '#f87171' }}>{a.qty}</td>
                    <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{a.reorderAt}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: STATUS[a.severity].bg, color: STATUS[a.severity].color }}>
                        {STATUS[a.severity].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}