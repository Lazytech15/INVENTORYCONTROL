import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

const STATUS = {
  critical: { label: 'CRITICAL', bg: '#2d0f0f', color: '#f87171' },
  low:      { label: 'LOW',      bg: '#3a1a0d', color: '#fb923c' },
  ok:       { label: 'HEALTHY',  bg: '#0d3320', color: '#4ade80' },
}

export default function DashboardMockup({ data }) {
  const { metrics, weeklyMovement, categoryBreakdown, lowStockItems } = data

  return (
    <div className="rounded-2xl overflow-hidden border border-[#2a2a3e] mb-16" style={{ background: '#1a1a2e' }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#111128' }}>
        <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        <span
          className="flex-1 mx-3 rounded px-3 py-1 text-[10px]"
          style={{ background: '#1f1f38', color: '#5a5a7a', fontFamily: 'DM Mono, monospace' }}
        >
          stockmaster.app/dashboard
        </span>
      </div>

      {/* Dashboard body */}
      <div className="p-5">
        {/* Header row */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold tracking-widest" style={{ color: '#e0e0f0' }}>
            INVENTORY DASHBOARD — MAY 2024
          </span>
          <span className="text-[10px]" style={{ color: '#5a5a7a', fontFamily: 'DM Mono, monospace' }}>
            Last sync: 2 min ago
          </span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { val: metrics.totalSKUs.toLocaleString(), lbl: 'TOTAL SKUs',       delta: metrics.skuGrowth,        up: true  },
            { val: metrics.stockValue,                  lbl: 'STOCK VALUE',      delta: metrics.stockValueGrowth, up: true  },
            { val: metrics.lowStockAlerts,              lbl: 'LOW STOCK ALERTS', delta: 'needs reorder',          up: false },
            { val: metrics.ordersToday,                 lbl: 'ORDERS TODAY',     delta: '+22% vs avg',            up: true  },
          ].map((k) => (
            <div
              key={k.lbl}
              className="rounded-lg p-3 border"
              style={{ background: '#222240', borderColor: '#2e2e50' }}
            >
              <div className="text-xl font-bold leading-none" style={{ color: '#e0e0f8' }}>
                {k.val}
              </div>
              <div className="text-[9px] mt-1 tracking-wider" style={{ color: '#5a5a7a', fontFamily: 'DM Mono, monospace' }}>
                {k.lbl}
              </div>
              <div
                className="text-[9px] mt-1"
                style={{ color: k.up ? '#4ade80' : '#fb923c', fontFamily: 'DM Mono, monospace' }}
              >
                {k.up ? '▲' : '▼'} {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Bar chart — 2/3 width */}
          <div
            className="col-span-2 rounded-lg p-3 border"
            style={{ background: '#222240', borderColor: '#2e2e50' }}
          >
            <div className="text-[10px] tracking-wider mb-3" style={{ color: '#5a5a7a', fontFamily: 'DM Mono, monospace' }}>
              WEEKLY STOCK MOVEMENT (UNITS)
            </div>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={weeklyMovement} barSize={8} barGap={2}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#5a5a7a', fontFamily: 'DM Mono, monospace' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#111128', border: '0.5px solid #2e2e50', borderRadius: 6, fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#e0e0f8' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="inbound" fill="#3a5aff" radius={[2, 2, 0, 0]} />
                <Bar dataKey="outbound" fill="#ff6b4a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1">
              {[['#3a5aff', 'INBOUND'], ['#ff6b4a', 'OUTBOUND']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  <span className="text-[9px]" style={{ color: '#5a5a7a', fontFamily: 'DM Mono, monospace' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut chart — 1/3 */}
          <div
            className="rounded-lg p-3 border flex flex-col"
            style={{ background: '#222240', borderColor: '#2e2e50' }}
          >
            <div className="text-[10px] tracking-wider mb-2" style={{ color: '#5a5a7a', fontFamily: 'DM Mono, monospace' }}>
              CATEGORY SPLIT
            </div>
            <div className="flex flex-col items-center flex-1">
              <PieChart width={80} height={80}>
                <Pie
                  data={categoryBreakdown}
                  cx={40} cy={40}
                  innerRadius={26} outerRadius={38}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="w-full mt-1">
                {categoryBreakdown.map((c) => (
                  <div
                    key={c.name}
                    className="flex justify-between items-center py-[3px] border-b text-[9px]"
                    style={{ borderColor: '#2a2a40', color: '#8888aa', fontFamily: 'DM Mono, monospace' }}
                  >
                    <span className="flex items-center gap-1">
                      <span className="w-[5px] h-[5px] rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                    <span>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Low stock table */}
        <div
          className="rounded-lg p-3 border overflow-x-auto"
          style={{ background: '#222240', borderColor: '#2e2e50' }}
        >
          <div className="text-[10px] tracking-wider mb-3" style={{ color: '#5a5a7a', fontFamily: 'DM Mono, monospace' }}>
            LOW STOCK ITEMS — PRIORITY REORDER
          </div>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['SKU', 'PRODUCT', 'QTY', 'REORDER PT.', 'SUPPLIER', 'STATUS'].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-2 px-1"
                    style={{ fontSize: 9, color: '#5a5a7a', fontFamily: 'DM Mono, monospace', borderBottom: '0.5px solid #2e2e50', fontWeight: 400, letterSpacing: '0.06em' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => (
                <tr key={item.sku} style={{ borderBottom: '0.5px solid #1e1e38' }}>
                  <td className="py-[5px] px-1 text-[10px]" style={{ color: '#9090b8', fontFamily: 'DM Mono, monospace' }}>{item.sku}</td>
                  <td className="py-[5px] px-1 text-[10px]" style={{ color: '#9090b8', fontFamily: 'DM Mono, monospace' }}>{item.name}</td>
                  <td className="py-[5px] px-1 text-[10px]" style={{ color: '#9090b8', fontFamily: 'DM Mono, monospace' }}>{item.qty}</td>
                  <td className="py-[5px] px-1 text-[10px]" style={{ color: '#9090b8', fontFamily: 'DM Mono, monospace' }}>{item.reorderAt}</td>
                  <td className="py-[5px] px-1 text-[10px]" style={{ color: '#9090b8', fontFamily: 'DM Mono, monospace' }}>{item.supplier}</td>
                  <td className="py-[5px] px-1">
                    <span
                      className="text-[9px] font-bold px-2 py-[2px] rounded"
                      style={{ background: STATUS[item.status].bg, color: STATUS[item.status].color }}
                    >
                      {STATUS[item.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
