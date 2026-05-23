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

export default function InventoryPage() {
  const { state, dispatch } = useApp()
  const { products, user } = state
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adjustModal, setAdjustModal] = useState(null) // product
  const [adjustDelta, setAdjustDelta] = useState('')
  const [adjustType, setAdjustType] = useState('outbound')
  const [adjustNote, setAdjustNote] = useState('')
  const [barcodeMode, setBarcodeMode] = useState(false)
  const [scanResult, setScanResult] = useState('')
  const barcodeInputRef = useRef(null)

  const canEdit = user?.role === 'admin' || user?.role === 'manager'
  const canDelete = user?.role === 'admin'

  // Barcode scan
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
        setScanResult(`✓ Found: ${found.name} (${found.sku}) — Qty: ${found.qty}`)
        setAdjustModal(found)
        setBarcodeMode(false)
      } else {
        setScanResult(`✗ No product found for: ${code}`)
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

  function getStatus(p) {
    if (p.qty === 0) return { label: 'OUT OF STOCK', bg: '#1a0d2e', color: '#c084fc' }
    if (p.qty <= p.reorderAt * 0.5) return { label: 'CRITICAL', bg: '#2d0f0f', color: '#f87171' }
    if (p.qty <= p.reorderAt) return { label: 'LOW STOCK', bg: '#3a1a0d', color: '#fb923c' }
    return { label: 'HEALTHY', bg: '#0d3320', color: '#4ade80' }
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e30' }}>
        <div className="flex-1">
          <h1 className="font-syne font-extrabold text-lg text-white">Inventory</h1>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: '#5a5a7a' }}>
            {filtered.length} products · ₱{totalValue.toLocaleString()} total value
          </p>
        </div>
        <button
          onClick={() => setBarcodeMode(b => !b)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: barcodeMode ? '#1a4fff' : '#1a1a2e', color: barcodeMode ? '#fff' : '#9090b8', border: '1px solid #2a2a3e' }}
        >
          <i className="ti ti-scan" /> Scan Barcode
        </button>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}>
          <i className="ti ti-table-export" /> CSV
        </button>
        {canEdit && (
          <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#1a4fff' }}>
            <i className="ti ti-plus" /> Add Product
          </button>
        )}
      </div>

      {/* Barcode scanner input */}
      {barcodeMode && (
        <div className="px-6 py-3 flex items-center gap-3" style={{ background: '#111128', borderBottom: '1px solid #2a2a3e' }}>
          <i className="ti ti-scan" style={{ color: '#1a4fff', fontSize: 18 }} />
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode or type SKU and press Enter..."
            onKeyDown={handleBarcodeScan}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#e2e2f0' }}
          />
          {scanResult && (
            <span className="text-xs font-mono" style={{ color: scanResult.startsWith('✓') ? '#4ade80' : '#f87171' }}>{scanResult}</span>
          )}
          <button onClick={() => { setBarcodeMode(false); setScanResult('') }} className="text-xs" style={{ color: '#5a5a7a' }}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="px-6 py-3 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e30' }}>
        <div className="relative flex-1 max-w-xs">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#5a5a7a' }} />
          <input
            type="text"
            placeholder="Search name, SKU, barcode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
            style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
          />
        </div>
        <div className="flex gap-1.5">
          {['All', ...CATEGORIES].map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className="px-2.5 py-1 rounded-md text-[10px] font-mono font-medium transition-all"
              style={{
                background: catFilter === c ? '#1a2a5e' : '#1a1a2e',
                color: catFilter === c ? '#6090ff' : '#5a5a7a',
                border: `1px solid ${catFilter === c ? '#2a3a7e' : '#2a2a3e'}`,
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono outline-none"
          style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#9090b8' }}
        >
          <option value="name">Sort: Name</option>
          <option value="qty">Sort: Qty</option>
          <option value="value">Sort: Value</option>
          <option value="sku">Sort: SKU</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead style={{ position: 'sticky', top: 0, background: '#0f0f1a', zIndex: 1 }}>
            <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
              {['SKU','PRODUCT','CATEGORY','QTY','REORDER','COST','PRICE','STATUS',''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 font-mono text-[9px]" style={{ color: '#5a5a7a', letterSpacing: '0.08em', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const st = getStatus(p)
              const sup = SUPPLIERS.find(s => s.id === p.supplierId)
              return (
                <tr key={p.id} className="group" style={{ borderBottom: '1px solid #1a1a28' }}>
                  <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{p.sku}</td>
                  <td className="px-4 py-2.5">
                    <div className="text-xs font-medium" style={{ color: '#c0c0e0' }}>{p.name}</div>
                    {sup && <div className="font-mono text-[9px]" style={{ color: '#3a3a5a' }}>{sup.name}</div>}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{p.category}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-bold" style={{ color: p.qty <= p.reorderAt ? '#f87171' : '#e2e2f0' }}>{p.qty}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>{p.reorderAt}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#6a6a8a' }}>₱{p.costPrice.toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: '#9090b8' }}>₱{p.salePrice.toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setAdjustModal(p); setAdjustDelta(''); setAdjustNote('') }}
                        className="p-1.5 rounded-md hover:opacity-80"
                        style={{ background: '#1a3a2e', color: '#4ade80' }}
                        title="Adjust stock"
                      >
                        <i className="ti ti-arrows-exchange" style={{ fontSize: 12 }} />
                      </button>
                      {canEdit && (
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:opacity-80" style={{ background: '#1a2a5e', color: '#6090ff' }} title="Edit">
                          <i className="ti ti-edit" style={{ fontSize: 12 }} />
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md hover:opacity-80" style={{ background: '#2d0f0f', color: '#f87171' }} title="Delete">
                          <i className="ti ti-trash" style={{ fontSize: 12 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#3a3a5a' }}>
            <i className="ti ti-package-off" style={{ fontSize: 40 }} />
            <p className="font-mono text-xs mt-3">No products found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl border w-full max-w-lg p-6 fade-up" style={{ background: '#13131f', borderColor: '#2a2a3e', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-lg text-white">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: '#5a5a7a' }}><i className="ti ti-x" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'SKU', field: 'sku', type: 'text' },
                { label: 'Barcode', field: 'barcode', type: 'text' },
              ].map(f => (
                <Field key={f.field} label={f.label} value={form[f.field]} onChange={v => handleFormChange(f.field, v)} type={f.type} />
              ))}
              <div className="col-span-2">
                <Field label="Product Name" value={form.name} onChange={v => handleFormChange('name', v)} type="text" />
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>CATEGORY</label>
                <select
                  value={form.category}
                  onChange={e => handleFormChange('category', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] mb-1.5" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>SUPPLIER</label>
                <select
                  value={form.supplierId}
                  onChange={e => handleFormChange('supplierId', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                >
                  <option value="">— Select —</option>
                  {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {[
                { label: 'Initial Qty', field: 'qty', type: 'number' },
                { label: 'Reorder Point', field: 'reorderAt', type: 'number' },
                { label: 'Cost Price (₱)', field: 'costPrice', type: 'number' },
                { label: 'Sale Price (₱)', field: 'salePrice', type: 'number' },
              ].map(f => (
                <Field key={f.field} label={f.label} value={form[f.field]} onChange={v => handleFormChange(f.field, v)} type={f.type} />
              ))}
              <div className="col-span-2">
                <label className="block font-mono text-[10px] mb-1.5" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>DESCRIPTION</label>
                <textarea
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  rows={2}
                  className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-xs" style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}>Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#1a4fff' }}>
                {editProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl border w-full max-w-sm p-6 fade-up" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-syne font-bold text-lg text-white">Adjust Stock</h2>
              <button onClick={() => setAdjustModal(null)} style={{ color: '#5a5a7a' }}><i className="ti ti-x" /></button>
            </div>
            <div className="rounded-lg p-3 mb-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a3e' }}>
              <div className="text-xs font-semibold" style={{ color: '#c0c0e0' }}>{adjustModal.name}</div>
              <div className="font-mono text-[10px] mt-0.5" style={{ color: '#5a5a7a' }}>{adjustModal.sku} · Current: {adjustModal.qty} units</div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                {['inbound','outbound'].map(t => (
                  <button
                    key={t}
                    onClick={() => setAdjustType(t)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: adjustType === t ? (t === 'inbound' ? '#0d3320' : '#3a1a0d') : '#1a1a2e',
                      color: adjustType === t ? (t === 'inbound' ? '#4ade80' : '#fb923c') : '#5a5a7a',
                      border: `1px solid ${adjustType === t ? (t === 'inbound' ? '#1a4a30' : '#5a2a0d') : '#2a2a3e'}`,
                    }}
                  >
                    <i className={`ti ${t === 'inbound' ? 'ti-arrow-down' : 'ti-arrow-up'} mr-1`} />
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <Field label="Quantity" value={adjustDelta} onChange={setAdjustDelta} type="number" placeholder="Enter units..." />
              <Field label="Note (optional)" value={adjustNote} onChange={setAdjustNote} type="text" placeholder="e.g. Sale, Restock, Damage..." />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setAdjustModal(null)} className="px-4 py-2 rounded-lg text-xs" style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}>Cancel</button>
              <button onClick={handleAdjust} className="px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: '#1a4fff' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block font-mono text-[10px] mb-1.5" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>{label.toUpperCase()}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2 text-xs outline-none"
        style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
      />
    </div>
  )
}