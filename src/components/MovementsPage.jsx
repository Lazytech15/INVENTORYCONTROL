import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function MovementsPage() {
  const { state } = useApp()
  const { movements, products } = state
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = useMemo(() => {
    return movements.filter(m => {
      const q = search.toLowerCase()
      const matchSearch = !q || m.productName?.toLowerCase().includes(q) || m.sku?.toLowerCase().includes(q) || m.note?.toLowerCase().includes(q)
      const matchType = typeFilter === 'all' || m.type === typeFilter
      const matchFrom = !dateFrom || m.date >= dateFrom
      const matchTo = !dateTo || m.date <= dateTo
      return matchSearch && matchType && matchFrom && matchTo
    })
  }, [movements, search, typeFilter, dateFrom, dateTo])

  const totalIn = filtered.filter(m => m.type === 'inbound').reduce((s, m) => s + m.qty, 0)
  const totalOut = filtered.filter(m => m.type === 'outbound').reduce((s, m) => s + m.qty, 0)

  function exportCSV() {
    const header = ['Date','SKU','Product','Type','Qty','Note']
    const rows = filtered.map(m => [m.date, m.sku, m.productName, m.type, m.qty, m.note || ''].join(','))
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'movements.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e30' }}>
        <div className="flex-1">
          <h1 className="font-syne font-extrabold text-lg text-white">Stock Movements</h1>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: '#5a5a7a' }}>
            {filtered.length} records · ↓{totalIn} in · ↑{totalOut} out
          </p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}>
          <i className="ti ti-table-export" /> CSV
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 flex items-center gap-3 flex-wrap flex-shrink-0" style={{ borderBottom: '1px solid #1e1e30' }}>
        <div className="relative">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#5a5a7a' }} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 rounded-lg text-xs outline-none w-52"
            style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
          />
        </div>
        <div className="flex gap-1.5">
          {['all','inbound','outbound'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all"
              style={{
                background: typeFilter === t ? (t === 'inbound' ? '#0d3320' : t === 'outbound' ? '#3a1a0d' : '#1a2a5e') : '#1a1a2e',
                color: typeFilter === t ? (t === 'inbound' ? '#4ade80' : t === 'outbound' ? '#fb923c' : '#6090ff') : '#5a5a7a',
                border: '1px solid #2a2a3e',
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2.5 py-1.5 rounded-lg text-xs outline-none" style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#9090b8' }} />
        <span className="text-xs" style={{ color: '#3a3a5a' }}>to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2.5 py-1.5 rounded-lg text-xs outline-none" style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#9090b8' }} />
        {(dateFrom || dateTo || search || typeFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setTypeFilter('all'); setDateFrom(''); setDateTo('') }} className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: '#2d0f0f', color: '#f87171', border: '1px solid #4a1a1a' }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead style={{ position: 'sticky', top: 0, background: '#0f0f1a', zIndex: 1 }}>
            <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
              {['DATE','SKU','PRODUCT','TYPE','QTY','NOTE'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-mono text-[9px]" style={{ color: '#5a5a7a', letterSpacing: '0.08em', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1a1a28' }}>
                <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{m.date}</td>
                <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{m.sku}</td>
                <td className="px-4 py-2.5 text-xs" style={{ color: '#c0c0e0' }}>{m.productName}</td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: m.type === 'inbound' ? '#0d3320' : '#3a1a0d',
                      color: m.type === 'inbound' ? '#4ade80' : '#fb923c',
                    }}
                  >
                    <i className={`ti ${m.type === 'inbound' ? 'ti-arrow-down' : 'ti-arrow-up'}`} style={{ fontSize: 10 }} />
                    {m.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs font-bold" style={{ color: m.type === 'inbound' ? '#4ade80' : '#fb923c' }}>
                  {m.type === 'inbound' ? '+' : '-'}{m.qty}
                </td>
                <td className="px-4 py-2.5 text-xs" style={{ color: '#5a5a7a' }}>{m.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#3a3a5a' }}>
            <i className="ti ti-arrows-exchange" style={{ fontSize: 40 }} />
            <p className="font-mono text-xs mt-3">No movements found</p>
          </div>
        )}
      </div>
    </div>
  )
}