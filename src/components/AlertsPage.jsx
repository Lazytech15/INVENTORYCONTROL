import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { SUPPLIERS } from '../data/seed.js'

function getSeverity(a) {
  if (a.qty === 0) return { label: 'Out of stock', bg: '#f3f4f6', color: '#374151', dot: '#6b7280', icon: 'ti-alert-octagon' }
  if (a.severity === 'critical') return { label: 'Critical', bg: '#fef2f2', color: '#991b1b', dot: '#dc2626', icon: 'ti-alert-triangle' }
  return { label: 'Low stock', bg: '#fffbeb', color: '#92400e', dot: '#d97706', icon: 'ti-alert-circle' }
}

export default function AlertsPage({ setPage }) {
  const { state } = useApp()
  const { alerts, products, user } = state
  const [selected, setSelected] = useState(new Set())

  const canOrder = user?.role === 'admin' || user?.role === 'manager'

  function getProduct(productId) {
    return products.find(p => p.id === productId)
  }

  function toggleSelect(id) {
    setSelected(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const critical = alerts.filter(a => a.severity === 'critical' || a.qty === 0)
  const low = alerts.filter(a => a.severity === 'low')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fb' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Alerts</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            {alerts.length} item{alerts.length !== 1 ? 's' : ''} need attention
          </p>
        </div>
        {selected.size > 0 && canOrder && (
          <button
            onClick={() => setPage('orders')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
          >
            <i className="ti ti-clipboard-plus" style={{ fontSize: 15 }} /> Create PO ({selected.size})
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className="ti ti-check" style={{ fontSize: 28, color: '#16a34a' }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>All clear!</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>All products are above reorder points</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {critical.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#dc2626', marginBottom: 10 }}>
                <i className="ti ti-alert-octagon" />
                Critical ({critical.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {critical.map((a, i) => (
                  <AlertCard key={a.id} a={a} index={i} selected={selected.has(a.productId)} onToggle={() => toggleSelect(a.productId)} getProduct={getProduct} canOrder={canOrder} />
                ))}
              </div>
            </div>
          )}
          {low.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#d97706', marginBottom: 10 }}>
                <i className="ti ti-alert-triangle" />
                Low stock ({low.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {low.map((a, i) => (
                  <AlertCard key={a.id} a={a} index={i} selected={selected.has(a.productId)} onToggle={() => toggleSelect(a.productId)} getProduct={getProduct} canOrder={canOrder} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AlertCard({ a, selected, onToggle, getProduct, canOrder, index }) {
  const st = getSeverity(a)
  const p = getProduct(a.productId)
  const sup = SUPPLIERS.find(s => s.id === p?.supplierId)
  const pct = Math.min(100, Math.round((a.qty / a.reorderAt) * 100))
  const isEven = index % 2 === 0

  return (
    <div
      onClick={canOrder ? onToggle : undefined}
      style={{
        background: selected ? '#f0f9ff' : (isEven ? '#ffffff' : '#fafbff'),
        border: `1px solid ${selected ? '#bae6fd' : '#e5e7eb'}`,
        borderRadius: 14, padding: '16px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        cursor: canOrder ? 'pointer' : 'default',
        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.2s, transform 0.2s',
        boxShadow: isEven
          ? '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
          : '0 6px 24px rgba(239,68,68,0.06), 0 2px 8px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = isEven
          ? '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
          : '0 6px 24px rgba(239,68,68,0.06), 0 2px 8px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {canOrder && (
        <div style={{
          width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2,
          background: selected ? '#0ea5e9' : '#fff',
          border: `1px solid ${selected ? '#0ea5e9' : '#d1d5db'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
        </div>
      )}

      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: st.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={`ti ${st.icon}`} style={{ color: st.dot, fontSize: 18 }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{a.name}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', borderRadius: 999, fontSize: 11, fontWeight: 500,
            background: st.bg, color: st.color,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: st.dot }} />
            {st.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
          <span>{a.sku}</span>
          {sup && <span><i className="ti ti-building" style={{ marginRight: 3, fontSize: 11 }} />{sup.name}</span>}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: '#f3f4f6', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: st.dot, borderRadius: 999, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500, color: st.dot }}>{a.qty}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#d1d5db' }}>/ {a.reorderAt}</span>
        </div>
      </div>

      {p && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>₱{p.salePrice.toLocaleString()}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af', marginTop: 2 }}>sale price</div>
        </div>
      )}
    </div>
  )
}