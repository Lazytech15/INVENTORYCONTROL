import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { SUPPLIERS } from '../data/seed.js'
import { format } from 'date-fns'

const STATUS_STYLES = {
  pending:   { label: 'PENDING',   bg: '#2a2a0d', color: '#f8c94e' },
  approved:  { label: 'APPROVED',  bg: '#0d2a1a', color: '#34d399' },
  delivered: { label: 'DELIVERED', bg: '#0d3320', color: '#4ade80' },
  cancelled: { label: 'CANCELLED', bg: '#2d0f0f', color: '#f87171' },
}

export default function PurchaseOrdersPage() {
  const { state, dispatch } = useApp()
  const { purchaseOrders, products, user } = state
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ supplierId: '', notes: '', items: [] })
  const [newItem, setNewItem] = useState({ productId: '', qty: 1 })
  const [viewPO, setViewPO] = useState(null)

  const canApprove = user?.role === 'admin' || user?.role === 'manager'

  function openNew() {
    // Pre-fill with low-stock items
    const { alerts } = state
    const items = alerts.slice(0, 3).map(a => {
      const product = products.find(p => p.id === a.productId)
      return {
        productId: a.productId,
        sku: a.sku,
        name: a.name,
        qty: Math.max(a.reorderAt * 2 - a.qty, 10),
        unitCost: product?.costPrice || 0,
      }
    })
    setForm({ supplierId: '', notes: '', items })
    setNewItem({ productId: '', qty: 1 })
    setShowModal(true)
  }

  function addItem() {
    if (!newItem.productId) return
    const p = products.find(pr => pr.id === newItem.productId)
    if (!p) return
    setForm(f => ({
      ...f,
      items: [...f.items.filter(i => i.productId !== p.id), {
        productId: p.id, sku: p.sku, name: p.name,
        qty: Number(newItem.qty), unitCost: p.costPrice,
      }],
    }))
    setNewItem({ productId: '', qty: 1 })
  }

  function removeItem(productId) {
    setForm(f => ({ ...f, items: f.items.filter(i => i.productId !== productId) }))
  }

  function handleCreate() {
    if (!form.supplierId || form.items.length === 0) return
    const po = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3,'0')}`,
      supplierId: form.supplierId,
      status: 'pending',
      createdAt: format(new Date(), 'yyyy-MM-dd'),
      deliveredAt: null,
      items: form.items,
      notes: form.notes,
    }
    dispatch({ type: 'ADD_PURCHASE_ORDER', payload: po })
    setShowModal(false)
  }

  function updateStatus(id, status) {
    dispatch({ type: 'UPDATE_PO_STATUS', payload: { id, status } })
  }

  function getTotal(po) {
    return po.items.reduce((s, i) => s + i.qty * i.unitCost, 0)
  }

  function exportPDF(po) {
    const sup = SUPPLIERS.find(s => s.id === po.supplierId)
    const content = `
PURCHASE ORDER: ${po.poNumber}
Date: ${po.createdAt}
Supplier: ${sup?.name || 'N/A'}
Status: ${po.status.toUpperCase()}

ITEMS:
${po.items.map(i => `  ${i.sku}  ${i.name}  Qty: ${i.qty}  Unit: ₱${i.unitCost.toLocaleString()}  Total: ₱${(i.qty * i.unitCost).toLocaleString()}`).join('\n')}

TOTAL: ₱${getTotal(po).toLocaleString()}

Notes: ${po.notes || 'None'}
    `.trim()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${po.poNumber}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e30' }}>
        <div className="flex-1">
          <h1 className="font-syne font-extrabold text-lg text-white">Purchase Orders</h1>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: '#5a5a7a' }}>{purchaseOrders.length} orders</p>
        </div>
        {canApprove && (
          <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#1a4fff' }}>
            <i className="ti ti-plus" /> New PO
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-3">
        {purchaseOrders.map(po => {
          const sup = SUPPLIERS.find(s => s.id === po.supplierId)
          const st = STATUS_STYLES[po.status]
          const total = getTotal(po)
          return (
            <div key={po.id} className="rounded-xl border p-4" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-bold" style={{ color: '#e2e2f0' }}>{po.poNumber}</span>
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: '#5a5a7a' }}>
                    <span><i className="ti ti-building mr-1" />{sup?.name || 'Unknown'}</span>
                    <span><i className="ti ti-calendar mr-1" />{po.createdAt}</span>
                    {po.deliveredAt && <span><i className="ti ti-check mr-1" />Delivered {po.deliveredAt}</span>}
                    <span><i className="ti ti-package mr-1" />{po.items.length} item{po.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  {po.notes && <div className="text-xs mt-1" style={{ color: '#4a4a6a' }}>{po.notes}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-syne font-bold text-lg" style={{ color: '#e2e2f0' }}>₱{total.toLocaleString()}</div>
                  <div className="font-mono text-[9px]" style={{ color: '#5a5a7a' }}>TOTAL VALUE</div>
                </div>
              </div>

              {/* Items preview */}
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #2a2a3e' }}>
                <div className="flex flex-wrap gap-2">
                  {po.items.map(item => (
                    <span key={item.productId} className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ background: '#1a1a2e', color: '#6a6a8a', border: '1px solid #2a2a3e' }}>
                      {item.sku} ×{item.qty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => setViewPO(po)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg" style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}>
                  <i className="ti ti-eye" style={{ fontSize: 12 }} /> View
                </button>
                <button onClick={() => exportPDF(po)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg" style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}>
                  <i className="ti ti-download" style={{ fontSize: 12 }} /> Export
                </button>
                {canApprove && po.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(po.id, 'approved')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg" style={{ background: '#0d2a1a', color: '#34d399', border: '1px solid #1a4a2a' }}>
                      <i className="ti ti-check" style={{ fontSize: 12 }} /> Approve
                    </button>
                    <button onClick={() => updateStatus(po.id, 'cancelled')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg" style={{ background: '#2d0f0f', color: '#f87171', border: '1px solid #4a1a1a' }}>
                      <i className="ti ti-x" style={{ fontSize: 12 }} /> Cancel
                    </button>
                  </>
                )}
                {canApprove && po.status === 'approved' && (
                  <button onClick={() => updateStatus(po.id, 'delivered')} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: '#0d3320', color: '#4ade80', border: '1px solid #1a5a30' }}>
                    <i className="ti ti-truck-delivery" style={{ fontSize: 12 }} /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {purchaseOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#3a3a5a' }}>
            <i className="ti ti-clipboard-list" style={{ fontSize: 40 }} />
            <p className="font-mono text-xs mt-3">No purchase orders yet</p>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl border w-full max-w-lg p-6 fade-up overflow-y-auto" style={{ background: '#13131f', borderColor: '#2a2a3e', maxHeight: '90vh' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-lg text-white">New Purchase Order</h2>
              <button onClick={() => setShowModal(false)} style={{ color: '#5a5a7a' }}><i className="ti ti-x" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] mb-1.5" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>SUPPLIER</label>
                <select
                  value={form.supplierId}
                  onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                >
                  <option value="">— Select Supplier —</option>
                  {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Items */}
              <div>
                <label className="block font-mono text-[10px] mb-2" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>ORDER ITEMS</label>
                <div className="space-y-2 mb-3">
                  {form.items.map(item => (
                    <div key={item.productId} className="flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: '#1a1a2e', border: '1px solid #2a2a3e' }}>
                      <span className="font-mono text-[9px]" style={{ color: '#6a6a8a' }}>{item.sku}</span>
                      <span className="flex-1" style={{ color: '#c0c0e0' }}>{item.name}</span>
                      <span className="font-mono" style={{ color: '#9090b8' }}>×{item.qty}</span>
                      <span className="font-mono" style={{ color: '#6a6a8a' }}>₱{(item.qty * item.unitCost).toLocaleString()}</span>
                      <button onClick={() => removeItem(item.productId)} style={{ color: '#f87171' }}><i className="ti ti-x" style={{ fontSize: 12 }} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={newItem.productId}
                    onChange={e => setNewItem(i => ({ ...i, productId: e.target.value }))}
                    className="flex-1 rounded-lg px-2.5 py-2 text-xs outline-none"
                    style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                  >
                    <option value="">Add product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={newItem.qty}
                    onChange={e => setNewItem(i => ({ ...i, qty: e.target.value }))}
                    className="w-16 rounded-lg px-2.5 py-2 text-xs outline-none"
                    style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                  />
                  <button onClick={addItem} className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1a4fff', color: '#fff' }}>Add</button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] mb-1.5" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>NOTES</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                />
              </div>

              {form.items.length > 0 && (
                <div className="rounded-lg px-3 py-2 text-right" style={{ background: '#1a1a2e', border: '1px solid #2a2a3e' }}>
                  <span className="font-mono text-[10px]" style={{ color: '#5a5a7a' }}>TOTAL: </span>
                  <span className="font-syne font-bold text-lg" style={{ color: '#e2e2f0' }}>
                    ₱{form.items.reduce((s, i) => s + i.qty * i.unitCost, 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}>Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#1a4fff' }}>Create PO</button>
            </div>
          </div>
        </div>
      )}

      {/* View PO Modal */}
      {viewPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl border w-full max-w-lg p-6 fade-up overflow-y-auto" style={{ background: '#13131f', borderColor: '#2a2a3e', maxHeight: '90vh' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-lg text-white">{viewPO.poNumber}</h2>
              <button onClick={() => setViewPO(null)} style={{ color: '#5a5a7a' }}><i className="ti ti-x" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Supplier', SUPPLIERS.find(s => s.id === viewPO.supplierId)?.name || 'N/A'],
                  ['Status', viewPO.status.toUpperCase()],
                  ['Created', viewPO.createdAt],
                  ['Delivered', viewPO.deliveredAt || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg px-3 py-2" style={{ background: '#1a1a2e', border: '1px solid #2a2a3e' }}>
                    <div className="font-mono text-[9px] mb-0.5" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>{l.toUpperCase()}</div>
                    <div className="text-xs font-medium" style={{ color: '#c0c0e0' }}>{v}</div>
                  </div>
                ))}
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                    {['SKU','PRODUCT','QTY','UNIT COST','TOTAL'].map(h => (
                      <th key={h} className="text-left py-2 font-mono text-[9px]" style={{ color: '#5a5a7a', letterSpacing: '0.06em', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewPO.items.map(item => (
                    <tr key={item.productId} style={{ borderBottom: '1px solid #1a1a28' }}>
                      <td className="py-2 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{item.sku}</td>
                      <td className="py-2 text-xs" style={{ color: '#c0c0e0' }}>{item.name}</td>
                      <td className="py-2 font-mono text-[10px]" style={{ color: '#9090b8' }}>{item.qty}</td>
                      <td className="py-2 font-mono text-[10px]" style={{ color: '#9090b8' }}>₱{item.unitCost.toLocaleString()}</td>
                      <td className="py-2 font-mono text-xs font-bold" style={{ color: '#e2e2f0' }}>₱{(item.qty * item.unitCost).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right">
                <span className="font-mono text-[10px]" style={{ color: '#5a5a7a' }}>TOTAL: </span>
                <span className="font-syne font-bold text-xl" style={{ color: '#e2e2f0' }}>₱{getTotal(viewPO).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}