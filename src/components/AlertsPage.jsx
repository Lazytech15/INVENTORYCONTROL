import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { SUPPLIERS } from '../data/seed.js'

export default function AlertsPage({ setPage }) {
  const { state, dispatch } = useApp()
  const { alerts, products, user } = state
  const [selected, setSelected] = useState(new Set())

  const canOrder = user?.role === 'admin' || user?.role === 'manager'

  function getProduct(productId) {
    return products.find(p => p.id === productId)
  }

  function getSeverity(a) {
    if (a.qty === 0) return { label: 'OUT OF STOCK', bg: '#1a0d2e', color: '#c084fc', icon: 'ti-alert-octagon' }
    if (a.severity === 'critical') return { label: 'CRITICAL',     bg: '#2d0f0f', color: '#f87171', icon: 'ti-alert-triangle' }
    return { label: 'LOW STOCK', bg: '#3a1a0d', color: '#fb923c', icon: 'ti-alert-circle' }
  }

  function toggleSelect(id) {
    setSelected(s => {
      const n = new Set(s)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function selectAll() {
    setSelected(alerts.length === selected.size ? new Set() : new Set(alerts.map(a => a.productId)))
  }

  function createPOFromSelected() {
    // Navigate to orders page — in a real app would pre-fill
    setPage('orders')
  }

  const critical = alerts.filter(a => a.severity === 'critical' || a.qty === 0)
  const low = alerts.filter(a => a.severity === 'low')

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e30' }}>
        <div className="flex-1">
          <h1 className="font-syne font-extrabold text-lg text-white">Alerts</h1>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: '#5a5a7a' }}>
            {alerts.length} item{alerts.length !== 1 ? 's' : ''} need attention
          </p>
        </div>
        {selected.size > 0 && canOrder && (
          <button
            onClick={createPOFromSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: '#1a4fff' }}
          >
            <i className="ti ti-clipboard-plus" /> Create PO ({selected.size})
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center" style={{ color: '#3a3a5a' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#0d3320' }}>
            <i className="ti ti-check" style={{ fontSize: 32, color: '#4ade80' }} />
          </div>
          <p className="font-syne font-bold text-lg text-white">All clear!</p>
          <p className="font-mono text-xs mt-1" style={{ color: '#5a5a7a' }}>All products are above reorder points</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {critical.length > 0 && (
            <div>
              <div className="font-mono text-[10px] mb-3 flex items-center gap-2" style={{ color: '#f87171', letterSpacing: '0.1em' }}>
                <i className="ti ti-alert-octagon" />
                CRITICAL ({critical.length})
              </div>
              <div className="space-y-2">
                {critical.map(a => <AlertCard key={a.id} a={a} selected={selected.has(a.productId)} onToggle={() => toggleSelect(a.productId)} getSeverity={getSeverity} getProduct={getProduct} canOrder={canOrder} />)}
              </div>
            </div>
          )}
          {low.length > 0 && (
            <div>
              <div className="font-mono text-[10px] mb-3 flex items-center gap-2" style={{ color: '#fb923c', letterSpacing: '0.1em' }}>
                <i className="ti ti-alert-triangle" />
                LOW STOCK ({low.length})
              </div>
              <div className="space-y-2">
                {low.map(a => <AlertCard key={a.id} a={a} selected={selected.has(a.productId)} onToggle={() => toggleSelect(a.productId)} getSeverity={getSeverity} getProduct={getProduct} canOrder={canOrder} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AlertCard({ a, selected, onToggle, getSeverity, getProduct, canOrder }) {
  const st = getSeverity(a)
  const p = getProduct(a.productId)
  const sup = SUPPLIERS.find(s => s.id === p?.supplierId)
  const pct = Math.min(100, Math.round((a.qty / a.reorderAt) * 100))

  return (
    <div
      className="rounded-xl border p-4 flex items-start gap-3 transition-all"
      style={{
        background: selected ? '#1a1a2e' : '#13131f',
        borderColor: selected ? '#2a3a7e' : '#2a2a3e',
        cursor: canOrder ? 'pointer' : 'default',
      }}
      onClick={canOrder ? onToggle : undefined}
    >
      {canOrder && (
        <div
          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: selected ? '#1a4fff' : '#2a2a3e', border: `1px solid ${selected ? '#1a4fff' : '#3a3a5a'}` }}
        >
          {selected && <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />}
        </div>
      )}

      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: st.bg }}
      >
        <i className={`ti ${st.icon}`} style={{ color: st.color, fontSize: 18 }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold" style={{ color: '#e2e2f0' }}>{a.name}</span>
          <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: st.bg, color: st.color }}>{st.label}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono mb-2" style={{ color: '#5a5a7a' }}>
          <span>{a.sku}</span>
          {sup && <span><i className="ti ti-building mr-0.5" />{sup.name}</span>}
        </div>

        {/* Stock bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#2a2a3e' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: st.color }}
            />
          </div>
          <span className="font-mono text-[10px] font-bold" style={{ color: st.color }}>{a.qty}</span>
          <span className="font-mono text-[10px]" style={{ color: '#3a3a5a' }}>/ {a.reorderAt} reorder pt.</span>
        </div>
      </div>

      {p && (
        <div className="text-right flex-shrink-0">
          <div className="font-syne font-bold text-base" style={{ color: '#e2e2f0' }}>₱{p.salePrice.toLocaleString()}</div>
          <div className="font-mono text-[9px]" style={{ color: '#5a5a7a' }}>SALE PRICE</div>
        </div>
      )}
    </div>
  )
}