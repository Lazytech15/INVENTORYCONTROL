import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { SUPPLIERS } from '../data/seed.js'
import { format } from 'date-fns'

const STATUS_STYLES = {
  pending:   { label: 'PENDING',   bg: '#fffbeb', color: '#92400e', border: '#fde68a', dot: '#d97706' },
  approved:  { label: 'APPROVED',  bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', dot: '#16a34a' },
  delivered: { label: 'DELIVERED', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
  cancelled: { label: 'CANCELLED', bg: '#fef2f2', color: '#991b1b', border: '#fecaca', dot: '#dc2626' },
}

// Alternating row backgrounds for even/odd cards
const ROW_BG = [
  { bg: '#ffffff', stripe: '#f9fafb' },
  { bg: '#fafbff', stripe: '#f3f6ff' },
]

export default function PurchaseOrdersPage() {
  const { state, dispatch } = useApp()
  const { purchaseOrders, products, user } = state
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ supplierId: '', notes: '', items: [] })
  const [newItem, setNewItem] = useState({ productId: '', qty: 1 })
  const [viewPO, setViewPO] = useState(null)

  const canApprove = user?.role === 'admin' || user?.role === 'manager'

  function openNew() {
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

  // shared input style for modals
  const inputStyle = {
    width: '100%', borderRadius: 8, padding: '8px 12px', fontSize: 12,
    outline: 'none', background: '#f9fafb', border: '1px solid #e5e7eb',
    color: '#111827', fontFamily: 'inherit',
  }

  const modalCardStyle = {
    background: '#fff',
    border: '1px solid #f3f4f6',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fb' }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#fff',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Purchase Orders</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            {purchaseOrders.length} order{purchaseOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canApprove && (
          <button
            onClick={openNew}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}
          >
            <i className="ti ti-plus" style={{ fontSize: 14 }} /> New PO
          </button>
        )}
      </div>

      {/* PO List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {purchaseOrders.map((po, idx) => {
          const sup = SUPPLIERS.find(s => s.id === po.supplierId)
          const st = STATUS_STYLES[po.status]
          const total = getTotal(po)
          const isEven = idx % 2 === 0
          const rowColors = isEven ? ROW_BG[0] : ROW_BG[1]

          return (
            <div
              key={po.id}
              style={{
                background: rowColors.bg,
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                padding: 0,
                overflow: 'hidden',
                boxShadow: isEven
                  ? '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
                  : '0 6px 24px rgba(37,99,235,0.07), 0 2px 8px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = isEven
                  ? '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
                  : '0 6px 24px rgba(37,99,235,0.07), 0 2px 8px rgba(0,0,0,0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Top section */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  {/* PO number + status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 14, fontWeight: 700, color: '#111827',
                    }}>{po.poNumber}</span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 5,
                      background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                      {st.label}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: 12, color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-building" style={{ fontSize: 13, color: '#9ca3af' }} />
                      {sup?.name || 'Unknown'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-calendar" style={{ fontSize: 13, color: '#9ca3af' }} />
                      {po.createdAt}
                    </span>
                    {po.deliveredAt && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a' }}>
                        <i className="ti ti-check" style={{ fontSize: 13 }} />
                        Delivered {po.deliveredAt}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-package" style={{ fontSize: 13, color: '#9ca3af' }} />
                      {po.items.length} item{po.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {po.notes && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>{po.notes}</div>
                  )}
                </div>

                {/* Total */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                    ₱{total.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#d1d5db', marginTop: 3, letterSpacing: '0.06em' }}>
                    TOTAL VALUE
                  </div>
                </div>
              </div>

              {/* Items strip — alternating stripe background */}
              <div style={{
                background: rowColors.stripe,
                borderTop: '1px solid #f3f4f6',
                borderBottom: '1px solid #f3f4f6',
                padding: '10px 20px',
                display: 'flex', flexWrap: 'wrap', gap: 6,
              }}>
                {po.items.map(item => (
                  <span key={item.productId} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, padding: '3px 8px', borderRadius: 5,
                    background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb',
                  }}>
                    {item.sku} ×{item.qty}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setViewPO(po)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, padding: '6px 12px', borderRadius: 7,
                    background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer',
                  }}
                >
                  <i className="ti ti-eye" style={{ fontSize: 13 }} /> View
                </button>
                <button
                  onClick={() => exportPDF(po)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, padding: '6px 12px', borderRadius: 7,
                    background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer',
                  }}
                >
                  <i className="ti ti-download" style={{ fontSize: 13 }} /> Export
                </button>

                {canApprove && po.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(po.id, 'approved')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12, padding: '6px 12px', borderRadius: 7,
                        background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', cursor: 'pointer',
                      }}
                    >
                      <i className="ti ti-check" style={{ fontSize: 13 }} /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(po.id, 'cancelled')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12, padding: '6px 12px', borderRadius: 7,
                        background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', cursor: 'pointer',
                      }}
                    >
                      <i className="ti ti-x" style={{ fontSize: 13 }} /> Cancel
                    </button>
                  </>
                )}

                {canApprove && po.status === 'approved' && (
                  <button
                    onClick={() => updateStatus(po.id, 'delivered')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 12, padding: '6px 14px', borderRadius: 7, fontWeight: 600,
                      background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                    }}
                  >
                    <i className="ti ti-truck-delivery" style={{ fontSize: 13 }} /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {purchaseOrders.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px 0', color: '#d1d5db',
          }}>
            <i className="ti ti-clipboard-list" style={{ fontSize: 48, marginBottom: 12 }} />
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>No purchase orders yet</p>
          </div>
        )}
      </div>

      {/* ── Create PO Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
        }}>
          <div style={modalCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>New Purchase Order</h2>
              <button onClick={() => setShowModal(false)} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                <i className="ti ti-x" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Supplier */}
              <div>
                <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 6 }}>SUPPLIER</label>
                <select
                  value={form.supplierId}
                  onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">— Select Supplier —</option>
                  {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Items */}
              <div>
                <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 8 }}>ORDER ITEMS</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {form.items.map((item, i) => (
                    <div key={item.productId} style={{
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                      padding: '8px 12px', borderRadius: 8,
                      background: i % 2 === 0 ? '#f9fafb' : '#f3f6ff',
                      border: '1px solid #e5e7eb',
                    }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af' }}>{item.sku}</span>
                      <span style={{ flex: 1, color: '#374151' }}>{item.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6b7280' }}>×{item.qty}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9ca3af' }}>₱{(item.qty * item.unitCost).toLocaleString()}</span>
                      <button onClick={() => removeItem(item.productId)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={newItem.productId}
                    onChange={e => setNewItem(i => ({ ...i, productId: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }}
                  >
                    <option value="">Add product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                  </select>
                  <input
                    type="number" min="1"
                    value={newItem.qty}
                    onChange={e => setNewItem(i => ({ ...i, qty: e.target.value }))}
                    style={{ ...inputStyle, width: 64 }}
                  />
                  <button
                    onClick={addItem}
                    style={{
                      padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer',
                    }}
                  >Add</button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 6 }}>NOTES</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              {/* Total */}
              {form.items.length > 0 && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, textAlign: 'right',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b7280' }}>TOTAL: </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                    ₱{form.items.reduce((s, i) => s + i.qty * i.unitCost, 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleCreate}
                style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
              >Create PO</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View PO Modal ── */}
      {viewPO && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
        }}>
          <div style={modalCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{viewPO.poNumber}</h2>
                {viewPO.notes && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{viewPO.notes}</p>}
              </div>
              <button onClick={() => setViewPO(null)} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                <i className="ti ti-x" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Supplier', SUPPLIERS.find(s => s.id === viewPO.supplierId)?.name || 'N/A'],
                  ['Status', viewPO.status.toUpperCase()],
                  ['Created', viewPO.createdAt],
                  ['Delivered', viewPO.deliveredAt || '—'],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: '10px 12px', borderRadius: 8, background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 3 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Items table */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['SKU','PRODUCT','QTY','UNIT COST','TOTAL'].map(h => (
                      <th key={h} style={{ textAlign: 'left', paddingBottom: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9ca3af', letterSpacing: '0.06em', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {viewPO.items.map((item, i) => (
                    <tr key={item.productId} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '9px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9ca3af' }}>{item.sku}</td>
                      <td style={{ padding: '9px 0', fontSize: 12, color: '#374151' }}>{item.name}</td>
                      <td style={{ padding: '9px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b7280' }}>{item.qty}</td>
                      <td style={{ padding: '9px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b7280' }}>₱{item.unitCost.toLocaleString()}</td>
                      <td style={{ padding: '9px 0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#111827' }}>₱{(item.qty * item.unitCost).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Grand total */}
              <div style={{ textAlign: 'right', padding: '12px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6b7280' }}>GRAND TOTAL: </span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>₱{getTotal(viewPO).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}