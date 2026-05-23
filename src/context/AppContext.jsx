import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { INITIAL_PRODUCTS, INITIAL_PURCHASE_ORDERS, USERS, generateMovements } from '../data/seed.js'
import { format } from 'date-fns'

const AppContext = createContext(null)

const STORAGE_KEY = 'stockmaster_pro_state'

function getInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  const products = INITIAL_PRODUCTS
  return {
    user: null,
    products,
    movements: generateMovements(products),
    purchaseOrders: INITIAL_PURCHASE_ORDERS,
    alerts: [],
    notifications: [],
  }
}

function computeAlerts(products) {
  return products
    .filter(p => p.qty <= p.reorderAt)
    .map(p => ({
      id: `alert-${p.id}`,
      productId: p.id,
      sku: p.sku,
      name: p.name,
      qty: p.qty,
      reorderAt: p.reorderAt,
      severity: p.qty === 0 ? 'out' : p.qty <= p.reorderAt * 0.5 ? 'critical' : 'low',
    }))
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload }

    case 'LOGOUT':
      return { ...state, user: null }

    case 'ADD_PRODUCT': {
      const products = [...state.products, action.payload]
      return { ...state, products, alerts: computeAlerts(products) }
    }

    case 'UPDATE_PRODUCT': {
      const products = state.products.map(p => p.id === action.payload.id ? action.payload : p)
      return { ...state, products, alerts: computeAlerts(products) }
    }

    case 'DELETE_PRODUCT': {
      const products = state.products.filter(p => p.id !== action.payload)
      return { ...state, products, alerts: computeAlerts(products) }
    }

    case 'ADJUST_STOCK': {
      const { productId, delta, type, note, userId } = action.payload
      const products = state.products.map(p => {
        if (p.id !== productId) return p
        return { ...p, qty: Math.max(0, p.qty + delta) }
      })
      const movement = {
        id: `mv-${Date.now()}`,
        productId,
        sku: state.products.find(p => p.id === productId)?.sku,
        productName: state.products.find(p => p.id === productId)?.name,
        type,
        qty: Math.abs(delta),
        date: format(new Date(), 'yyyy-MM-dd'),
        note: note || '',
        userId,
      }
      return {
        ...state,
        products,
        movements: [movement, ...state.movements],
        alerts: computeAlerts(products),
      }
    }

    case 'ADD_PURCHASE_ORDER':
      return { ...state, purchaseOrders: [action.payload, ...state.purchaseOrders] }

    case 'UPDATE_PO_STATUS': {
      const purchaseOrders = state.purchaseOrders.map(po => {
        if (po.id !== action.payload.id) return po
        const updated = { ...po, status: action.payload.status }
        if (action.payload.status === 'delivered') {
          updated.deliveredAt = format(new Date(), 'yyyy-MM-dd')
        }
        return updated
      })
      // If delivered, update stock
      if (action.payload.status === 'delivered') {
        const po = state.purchaseOrders.find(p => p.id === action.payload.id)
        let products = [...state.products]
        const newMovements = []
        po.items.forEach(item => {
          products = products.map(p => {
            if (p.id !== item.productId) return p
            return { ...p, qty: p.qty + item.qty }
          })
          newMovements.push({
            id: `mv-${Date.now()}-${item.productId}`,
            productId: item.productId,
            sku: item.sku,
            productName: item.name,
            type: 'inbound',
            qty: item.qty,
            date: format(new Date(), 'yyyy-MM-dd'),
            note: `PO ${po.poNumber} received`,
            userId: state.user?.id,
          })
        })
        return {
          ...state,
          purchaseOrders,
          products,
          movements: [...newMovements, ...state.movements],
          alerts: computeAlerts(products),
        }
      }
      return { ...state, purchaseOrders }
    }

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications.slice(0, 19)] }

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] }

    case 'RECOMPUTE_ALERTS':
      return { ...state, alerts: computeAlerts(state.products) }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState)

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  // Compute alerts on boot
  useEffect(() => {
    dispatch({ type: 'RECOMPUTE_ALERTS' })
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, USERS }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}