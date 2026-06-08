import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function MovementsPage() {
  const { state } = useApp()
  const { movements } = state
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

  const hasFilters = search || typeFilter !== 'all' || dateFrom || dateTo

  const inputStyle = {
    padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e7eb',
    background: '#f9fafb', color: '#111827', fontSize: 13, outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Stock Movements</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            {filtered.length} records · ↓ {totalIn} in · ↑ {totalOut} out
          </p>
        </div>
        <button
          onClick={exportCSV}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, cursor: 'pointer' }}
        >
          <i className="ti ti-table-export" style={{ fontSize: 15 }} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32, width: 200 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { val: 'all', label: 'All' },
            { val: 'inbound', label: 'Inbound' },
            { val: 'outbound', label: 'Outbound' },
          ].map(t => (
            <button
              key={t.val}
              onClick={() => setTypeFilter(t.val)}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                border: typeFilter === t.val ? '1px solid #d1d5db' : '1px solid transparent',
                background: typeFilter === t.val ? '#fff' : 'transparent',
                color: typeFilter === t.val
                  ? (t.val === 'inbound' ? '#16a34a' : t.val === 'outbound' ? '#d97706' : '#111827')
                  : '#6b7280',
                fontWeight: typeFilter === t.val ? 500 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, fontSize: 12 }} />
        <span style={{ fontSize: 12, color: '#9ca3af' }}>to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, fontSize: 12 }} />

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setTypeFilter('all'); setDateFrom(''); setDateTo('') }}
            style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['Date', 'SKU', 'Product', 'Type', 'Qty', 'Note'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '9px 16px', fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #f9fafb' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af' }}>{m.date}</td>
                <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af' }}>{m.sku}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, color: '#111827' }}>{m.productName}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500,
                    padding: '3px 8px', borderRadius: 999,
                    background: m.type === 'inbound' ? '#f0fdf4' : '#fffbeb',
                    color: m.type === 'inbound' ? '#16a34a' : '#d97706',
                  }}>
                    <i className={`ti ${m.type === 'inbound' ? 'ti-arrow-down' : 'ti-arrow-up'}`} style={{ fontSize: 11 }} />
                    {m.type}
                  </span>
                </td>
                <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: m.type === 'inbound' ? '#16a34a' : '#d97706' }}>
                  {m.type === 'inbound' ? '+' : '-'}{m.qty}
                </td>
                <td style={{ padding: '10px 16px', fontSize: 12, color: '#9ca3af' }}>{m.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#d1d5db' }}>
            <i className="ti ti-arrows-exchange" style={{ fontSize: 40, marginBottom: 12 }} />
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>No movements found</p>
          </div>
        )}
      </div>
    </div>
  )
}