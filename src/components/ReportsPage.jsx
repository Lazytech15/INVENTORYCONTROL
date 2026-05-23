import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { subDays, format } from 'date-fns'

const COLORS = ['#3a5aff', '#ff6b4a', '#4ade80', '#f8c94e', '#c084fc', '#38bdf8']

export default function ReportsPage() {
  const { state } = useApp()
  const { products, movements } = state
  const [range, setRange] = useState(30)

  const rangeStart = format(subDays(new Date(), range - 1), 'yyyy-MM-dd')

  const rangeMovements = useMemo(() =>
    movements.filter(m => m.date >= rangeStart),
    [movements, rangeStart]
  )

  // Daily movement trend
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

  // Top moving products
  const topMoving = useMemo(() => {
    const map = {}
    rangeMovements.filter(m => m.type === 'outbound').forEach(m => {
      map[m.productName] = (map[m.productName] || 0) + m.qty
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, qty]) => ({ name: name.slice(0,22), qty }))
  }, [rangeMovements])

  // Category value
  const categoryValue = useMemo(() => {
    const cats = {}
    products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + p.qty * p.salePrice })
    return Object.entries(cats).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
  }, [products])

  // Summary stats
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
      '',
      '=== INVENTORY BY PRODUCT ===',
      ['SKU','Name','Category','Qty','Reorder','Cost','Sale','Value'].join('\t'),
      ...products.map(p => [p.sku, p.name, p.category, p.qty, p.reorderAt, p.costPrice, p.salePrice, p.qty * p.salePrice].join('\t')),
      '',
      '=== TOP MOVING PRODUCTS ===',
      ...topMoving.map(t => `${t.name}\t${t.qty} units out`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `stockmaster-report-${format(new Date(), 'yyyy-MM-dd')}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  function fmt(n) {
    if (n >= 1000000) return `₱${(n/1000000).toFixed(2)}M`
    if (n >= 1000) return `₱${(n/1000).toFixed(1)}K`
    return `₱${n.toLocaleString()}`
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e30' }}>
        <div className="flex-1">
          <h1 className="font-syne font-extrabold text-lg text-white">Reports</h1>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: '#5a5a7a' }}>Inventory analytics & summaries</p>
        </div>
        <div className="flex gap-1.5">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all"
              style={{
                background: range === d ? '#1a2a5e' : '#1a1a2e',
                color: range === d ? '#6090ff' : '#5a5a7a',
                border: `1px solid ${range === d ? '#2a3a7e' : '#2a2a3e'}`,
              }}
            >
              {d}d
            </button>
          ))}
        </div>
        <button onClick={exportReport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}>
          <i className="ti ti-download" /> Export
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { val: fmt(totalStockValue), lbl: 'STOCK VALUE (SALE)', color: '#3a5aff', icon: 'ti-coin' },
            { val: fmt(totalCostValue),  lbl: 'STOCK VALUE (COST)', color: '#38bdf8', icon: 'ti-cash' },
            { val: fmt(margin),          lbl: 'MARGIN POTENTIAL',   color: '#4ade80', icon: 'ti-trending-up' },
            { val: `${totalIn} / ${totalOut}`, lbl: `IN / OUT (${range}d)`, color: '#f8c94e', icon: 'ti-arrows-exchange' },
          ].map((k, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${k.color}18` }}>
                <i className={`ti ${k.icon}`} style={{ color: k.color, fontSize: 16 }} />
              </div>
              <div className="font-syne font-extrabold text-xl text-white leading-none">{k.val}</div>
              <div className="font-mono text-[9px] mt-1" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>{k.lbl}</div>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div className="rounded-xl border p-5" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <div className="font-mono text-[10px] mb-4" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>DAILY MOVEMENT TREND (LAST {Math.min(range, 14)} DAYS)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#5a5a7a', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#5a5a7a', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: '#111128', border: '1px solid #2e2e50', borderRadius: 8, fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#e0e0f8' }} />
              <Line type="monotone" dataKey="inbound" stroke="#3a5aff" strokeWidth={2} dot={false} name="Inbound" />
              <Line type="monotone" dataKey="outbound" stroke="#ff6b4a" strokeWidth={2} dot={false} name="Outbound" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[['#3a5aff','INBOUND'],['#ff6b4a','OUTBOUND']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5" style={{ background: c }} />
                <span className="font-mono text-[9px]" style={{ color: '#5a5a7a' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Top moving */}
          <div className="rounded-xl border p-5" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
            <div className="font-mono text-[10px] mb-4" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>TOP MOVING PRODUCTS (OUTBOUND, {range}d)</div>
            {topMoving.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topMoving} layout="vertical" barSize={8}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6a6a8a', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip formatter={v => [v, 'Units']} contentStyle={{ background: '#111128', border: '1px solid #2e2e50', borderRadius: 8, fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#e0e0f8' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="qty" fill="#3a5aff" radius={[0,2,2,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-32 font-mono text-xs" style={{ color: '#3a3a5a' }}>No data for period</div>
            )}
          </div>

          {/* Category value */}
          <div className="rounded-xl border p-5" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
            <div className="font-mono text-[10px] mb-4" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>STOCK VALUE BY CATEGORY</div>
            <div className="flex items-center gap-4">
              <PieChart width={120} height={120}>
                <Pie data={categoryValue} cx={60} cy={60} innerRadius={36} outerRadius={54} dataKey="value" strokeWidth={0}>
                  {categoryValue.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {categoryValue.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span style={{ color: '#9090b8' }}>{c.name}</span>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <div className="px-5 py-3 font-mono text-[10px]" style={{ color: '#5a5a7a', letterSpacing: '0.08em', borderBottom: '1px solid #2a2a3e' }}>
            FULL INVENTORY SNAPSHOT
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                  {['SKU','PRODUCT','CATEGORY','QTY','COST','SALE','STOCK VALUE','MARGIN'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[9px]" style={{ color: '#5a5a7a', letterSpacing: '0.08em', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...products].sort((a,b) => (b.qty*b.salePrice)-(a.qty*a.salePrice)).map(p => {
                  const val = p.qty * p.salePrice
                  const cost = p.qty * p.costPrice
                  const mgn = val - cost
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1a1a28' }}>
                      <td className="px-4 py-2 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{p.sku}</td>
                      <td className="px-4 py-2 text-xs" style={{ color: '#c0c0e0' }}>{p.name}</td>
                      <td className="px-4 py-2 font-mono text-[10px]" style={{ color: '#5a5a7a' }}>{p.category}</td>
                      <td className="px-4 py-2 font-mono text-xs" style={{ color: '#e2e2f0' }}>{p.qty}</td>
                      <td className="px-4 py-2 font-mono text-[10px]" style={{ color: '#5a5a7a' }}>₱{p.costPrice.toLocaleString()}</td>
                      <td className="px-4 py-2 font-mono text-[10px]" style={{ color: '#5a5a7a' }}>₱{p.salePrice.toLocaleString()}</td>
                      <td className="px-4 py-2 font-mono text-xs font-bold" style={{ color: '#9090b8' }}>₱{val.toLocaleString()}</td>
                      <td className="px-4 py-2 font-mono text-xs font-bold" style={{ color: mgn > 0 ? '#4ade80' : '#f87171' }}>₱{mgn.toLocaleString()}</td>
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