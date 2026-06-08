import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES, SUPPLIERS } from '../data/seed.js'

const EMPTY_FORM = {
  sku: '', name: '', category: CATEGORIES[0], supplierId: '',
  qty: 0, reorderAt: 10, costPrice: 0, salePrice: 0,
  barcode: '', description: '',
}

function genSKU(category) {
  const prefix = { Electronics: 'EL', Apparel: 'AP', 'Home Goods': 'HG', 'Food & Bev': 'FB', Office: 'OF', Tools: 'TL' }
  return `${prefix[category] || 'XX'}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

function getStatus(p) {
  if (p.qty === 0) return { label: 'Out of stock', dot: '#6b7280', bg: '#f3f4f6', color: '#374151' }
  if (p.qty <= p.reorderAt * 0.5) return { label: 'Critical', dot: '#dc2626', bg: '#fef2f2', color: '#991b1b' }
  if (p.qty <= p.reorderAt) return { label: 'Low stock', dot: '#d97706', bg: '#fffbeb', color: '#92400e' }
  return { label: 'Healthy', dot: '#16a34a', bg: '#f0fdf4', color: '#166534' }
}

export default function InventoryPage() {
  const { state, dispatch } = useApp()
  const { products, user } = state
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adjustModal, setAdjustModal] = useState(null)
  const [adjustDelta, setAdjustDelta] = useState('')
  const [adjustType, setAdjustType] = useState('outbound')
  const [adjustNote, setAdjustNote] = useState('')
  const [barcodeMode, setBarcodeMode] = useState(false)
  const [scanResult, setScanResult] = useState('')
  const barcodeInputRef = useRef(null)

  const canEdit = user?.role === 'admin' || user?.role === 'manager'
  const canDelete = user?.role === 'admin'

  useEffect(() => {
    if (barcodeMode && barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [barcodeMode])

  function handleBarcodeScan(e) {
    if (e.key === 'Enter') {
      const code = e.target.value.trim()
      if (!code) return
      const found = products.find(p => p.barcode === code || p.sku === code)
      if (found) {
        setScanResult(`Found: ${found.name} (${found.sku}) — Qty: ${found.qty}`)
        setAdjustModal(found)
        setBarcodeMode(false)
      } else {
        setScanResult(`No product found for: ${code}`)
      }
      e.target.value = ''
    }
  }

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase()
      return (
        (catFilter === 'All' || p.category === catFilter) &&
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode?.includes(q))
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'qty') return a.qty - b.qty
      if (sortBy === 'value') return (b.qty * b.salePrice) - (a.qty * a.salePrice)
      if (sortBy === 'sku') return a.sku.localeCompare(b.sku)
      return 0
    })

  function openAdd() {
    setEditProduct(null)
    setForm({ ...EMPTY_FORM, sku: genSKU(EMPTY_FORM.category) })
    setShowModal(true)
  }

  function openEdit(p) {
    setEditProduct(p)
    setForm({ ...p })
    setShowModal(true)
  }

  function handleFormChange(field, val) {
    setForm(f => {
      const updated = { ...f, [field]: val }
      if (field === 'category') updated.sku = genSKU(val)
      return updated
    })
  }

  function handleSave() {
    if (!form.name || !form.sku) return
    if (editProduct) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...form, id: editProduct.id } })
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: { ...form, id: `p-${Date.now()}`, qty: Number(form.qty) } })
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (confirm('Delete this product?')) dispatch({ type: 'DELETE_PRODUCT', payload: id })
  }

  function handleAdjust() {
    const delta = parseInt(adjustDelta)
    if (!delta || delta === 0) return
    const actualDelta = adjustType === 'outbound' ? -Math.abs(delta) : Math.abs(delta)
    dispatch({
      type: 'ADJUST_STOCK',
      payload: { productId: adjustModal.id, delta: actualDelta, type: adjustType, note: adjustNote, userId: user.id },
    })
    setAdjustModal(null)
    setAdjustDelta('')
    setAdjustNote('')
  }

  function exportCSV() {
    const header = ['SKU','Name','Category','Qty','Reorder At','Cost Price','Sale Price','Stock Value','Supplier','Barcode']
    const rows = filtered.map(p => {
      const sup = SUPPLIERS.find(s => s.id === p.supplierId)
      return [p.sku, p.name, p.category, p.qty, p.reorderAt, p.costPrice, p.salePrice, p.qty * p.salePrice, sup?.name || '', p.barcode || ''].join(',')
    })
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'inventory.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const totalValue = filtered.reduce((s, p) => s + p.qty * p.salePrice, 0)

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
    border: '1px solid #e5e7eb', background: '#fff', color: '#374151',
    transition: 'background 0.12s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fb' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Inventory</h1>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
            {filtered.length} products · ₱{totalValue.toLocaleString()} total value
          </p>
        </div>
        <button
          onClick={() => setBarcodeMode(b => !b)}
          style={{ ...btnBase, background: barcodeMode ? '#111827' : '#fff', color: barcodeMode ? '#fff' : '#374151', borderColor: barcodeMode ? '#111827' : '#e5e7eb' }}
        >
          <i className="ti ti-scan" style={{ fontSize: 15 }} /> Scan barcode
        </button>
        <button onClick={exportCSV} style={btnBase}>
          <i className="ti ti-table-export" style={{ fontSize: 15 }} /> Export CSV
        </button>
        {canEdit && (
          <button
            onClick={openAdd}
            style={{ ...btnBase, background: '#2563eb', color: '#fff', borderColor: '#2563eb', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
          >
            <i className="ti ti-plus" style={{ fontSize: 15 }} /> Add product
          </button>
        )}
      </div>

      {/* Barcode scanner input */}
      {barcodeMode && (
        <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
          <i className="ti ti-scan" style={{ color: '#6b7280', fontSize: 16 }} />
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode or type SKU and press Enter…"
            onKeyDown={handleBarcodeScan}
            style={{ flex: 1, background: 'transparent', outline: 'none', fontSize: 13, color: '#111827', border: 'none' }}
          />
          {scanResult && (
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: scanResult.startsWith('Found') ? '#16a34a' : '#dc2626' }}>{scanResult}</span>
          )}
          <button onClick={() => { setBarcodeMode(false); setScanResult('') }} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', flexShrink: 0 }}>
        {[
          { label: 'Total SKUs', value: filtered.length, color: '#111827' },
          { label: 'Total units', value: filtered.reduce((s, p) => s + p.qty, 0).toLocaleString(), color: '#111827' },
          { label: 'Low stock', value: filtered.filter(p => p.qty <= p.reorderAt && p.qty > 0).length, color: '#d97706' },
          { label: 'Out of stock', value: filtered.filter(p => p.qty === 0).length, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ padding: '12px 24px', borderRight: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search name, SKU, barcode…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#f9fafb', color: '#111827', fontSize: 13,
              outline: 'none', width: 220,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['All', ...CATEGORIES].map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                padding: '5px 10px', borderRadius: 999, fontSize: 12,
                border: catFilter === c ? '1px solid #d1d5db' : '1px solid transparent',
                background: catFilter === c ? '#fff' : 'transparent',
                color: catFilter === c ? '#111827' : '#6b7280',
                fontWeight: catFilter === c ? 500 : 400,
                cursor: 'pointer', transition: 'all 0.1s',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            marginLeft: 'auto', padding: '6px 10px', borderRadius: 8,
            border: '1px solid #e5e7eb', background: '#f9fafb',
            color: '#6b7280', fontSize: 12, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="name">Sort: Name</option>
          <option value="qty">Sort: Qty</option>
          <option value="value">Sort: Value</option>
          <option value="sku">Sort: SKU</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['SKU', 'Product', 'Category', 'Qty', 'Reorder', 'Cost', 'Price', 'Status', ''].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '9px 16px',
                  fontSize: 11, fontWeight: 500, color: '#9ca3af',
                  letterSpacing: '0.04em', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, rowIdx) => {
              const st = getStatus(p)
              const sup = SUPPLIERS.find(s => s.id === p.supplierId)
              const isEven = rowIdx % 2 === 0
              return (
                <tr key={p.id} className="group" style={{ borderBottom: '1px solid #f3f4f6', background: isEven ? '#fff' : '#fafbff' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                  onMouseLeave={e => e.currentTarget.style.background = isEven ? '#fff' : '#fafbff'}
                >
                  <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9ca3af' }}>{p.sku}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{p.name}</div>
                    {sup && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#d1d5db', marginTop: 2 }}>{sup.name}</div>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                      fontSize: 11, background: '#f3f4f6', color: '#6b7280',
                      border: '1px solid #e5e7eb',
                    }}>{p.category}</span>
                  </td>
                  <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: p.qty <= p.reorderAt ? '#dc2626' : '#111827' }}>{p.qty}</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9ca3af' }}>{p.reorderAt}</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9ca3af' }}>₱{p.costPrice.toLocaleString()}</td>
                  <td style={{ padding: '10px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6b7280' }}>₱{p.salePrice.toLocaleString()}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500,
                      background: st.bg, color: st.color,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                      {st.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.12s' }}
                      className="row-actions"
                    >
                      <ActionBtn icon="ti-arrows-exchange" title="Adjust stock" bg="#f0fdf4" color="#16a34a"
                        onClick={() => { setAdjustModal(p); setAdjustDelta(''); setAdjustNote('') }} />
                      {canEdit && <ActionBtn icon="ti-edit" title="Edit" bg="#eff6ff" color="#1d4ed8" onClick={() => openEdit(p)} />}
                      {canDelete && <ActionBtn icon="ti-trash" title="Delete" bg="#fef2f2" color="#dc2626" onClick={() => handleDelete(p.id)} />}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#d1d5db' }}>
            <i className="ti ti-package-off" style={{ fontSize: 40, marginBottom: 12 }} />
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>No products found</p>
          </div>
        )}
        </div>
      </div>

      {/* Style for row-actions hover */}
      <style>{`tr:hover .row-actions { opacity: 1 !important; }`}</style>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editProduct ? 'Edit product' : 'Add product'}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'SKU', field: 'sku', type: 'text' },
              { label: 'Barcode', field: 'barcode', type: 'text' },
            ].map(f => (
              <Field key={f.field} label={f.label} value={form[f.field]} onChange={v => handleFormChange(f.field, v)} type={f.type} />
            ))}
            <div style={{ gridColumn: 'span 2' }}>
              <Field label="Product name" value={form.name} onChange={v => handleFormChange('name', v)} type="text" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => handleFormChange('category', e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Supplier</label>
              <select value={form.supplierId} onChange={e => handleFormChange('supplierId', e.target.value)} style={inputStyle}>
                <option value="">— Select —</option>
                {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {[
              { label: 'Initial qty', field: 'qty', type: 'number' },
              { label: 'Reorder point', field: 'reorderAt', type: 'number' },
              { label: 'Cost price (₱)', field: 'costPrice', type: 'number' },
              { label: 'Sale price (₱)', field: 'salePrice', type: 'number' },
            ].map(f => (
              <Field key={f.field} label={f.label} value={form[f.field]} onChange={v => handleFormChange(f.field, v)} type={f.type} />
            ))}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={e => handleFormChange('description', e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
              {editProduct ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </Modal>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <Modal onClose={() => setAdjustModal(null)} title="Adjust stock">
          <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{adjustModal.name}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{adjustModal.sku} · Current: {adjustModal.qty} units</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['inbound', 'outbound'].map(t => (
              <button
                key={t}
                onClick={() => setAdjustType(t)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.1s',
                  background: adjustType === t ? (t === 'inbound' ? '#f0fdf4' : '#fef2f2') : '#f9fafb',
                  color: adjustType === t ? (t === 'inbound' ? '#16a34a' : '#dc2626') : '#9ca3af',
                  border: `1px solid ${adjustType === t ? (t === 'inbound' ? '#bbf7d0' : '#fecaca') : '#e5e7eb'}`,
                }}
              >
                <i className={`ti ${t === 'inbound' ? 'ti-arrow-down' : 'ti-arrow-up'}`} style={{ marginRight: 6 }} />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Quantity" value={adjustDelta} onChange={setAdjustDelta} type="number" placeholder="Enter units…" />
            <Field label="Note (optional)" value={adjustNote} onChange={setAdjustNote} type="text" placeholder="e.g. Sale, Restock, Damage…" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button onClick={() => setAdjustModal(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
            <button onClick={handleAdjust} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>Confirm</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: '#374151', marginBottom: 6,
}

const inputStyle = {
  width: '100%', borderRadius: 8, border: '1px solid #e5e7eb',
  background: '#f9fafb', color: '#111827', fontSize: 13,
  padding: '8px 10px', outline: 'none',
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
}

function ActionBtn({ icon, title, bg, color, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 6,
        background: bg, color, border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 13 }} />
    </button>
  )
}

function Modal({ children, onClose, title }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
    }}>
      <div className="fade-up" style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
        width: '100%', maxWidth: 480, padding: '24px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}