import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import logo from '../../public/inventorycontrol_logo.png'

export default function LoginPage() {
  const { dispatch, USERS } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password)
      if (user) {
        dispatch({ type: 'LOGIN', payload: user })
      } else {
        setError('Invalid email or password.')
      }
      setLoading(false)
    }, 500)
  }

  function quickLogin(user) {
    setEmail(user.email)
    setPassword(user.password)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src={logo}
            alt="Inventory Control Logo"
            style={{ height: 200, width: 'auto', marginBottom: 5, objectFit: 'contain', display: 'block', margin: '0 auto 14px' }}
          />
          <p style={{ fontSize: 14, color: '#6b7280' }}>Sign in to your account</p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb', color: '#111827',
                  fontSize: 14, padding: '10px 12px',
                  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb', color: '#111827',
                  fontSize: 14, padding: '10px 12px',
                  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: 8, fontSize: 13, padding: '10px 14px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', borderRadius: 8,
                background: '#2563eb', color: '#fff',
                fontSize: 14, fontWeight: 600,
                padding: '11px 0', marginTop: 4,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.15s',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.7' : '1' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Quick login */}
          <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, color: '#d1d5db', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 10,
            }}>
              Quick login (demo)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {USERS.map(u => {
                const roleStyle = {
                  admin:   { bg: '#eff6ff', color: '#1d4ed8' },
                  manager: { bg: '#f0fdf4', color: '#15803d' },
                  staff:   { bg: '#fffbeb', color: '#b45309' },
                }[u.role]
                return (
                  <button
                    key={u.id}
                    onClick={() => quickLogin(u)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#f9fafb', border: '1px solid #f3f4f6',
                      borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                      transition: 'background 0.12s, border-color 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#f3f4f6' }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{u.name}</span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10, padding: '3px 8px', borderRadius: 4,
                      background: roleStyle.bg, color: roleStyle.color, fontWeight: 500,
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}