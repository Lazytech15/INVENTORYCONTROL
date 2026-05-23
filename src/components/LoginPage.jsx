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
    }, 600)
  }

  function quickLogin(user) {
    setEmail(user.email)
    setPassword(user.password)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0d0d14', padding: '2rem' }}
    >
      <div
        className="w-full rounded-3xl overflow-hidden"
        style={{
          maxWidth: 960,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 560,
          border: '1px solid #2a2a3e',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >

        {/* ── LEFT: Logo panel ── */}
        <div
          className="flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #0d1a3a 0%, #0a1128 50%, #060d1f 100%)',
            padding: '3rem 2.5rem',
            borderRight: '1px solid #1e2a4a',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative glow */}
          <div style={{
            position: 'absolute', width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,79,255,0.18) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }} />
          {/* Decorative rings */}
          <div style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            border: '1px solid rgba(26,79,255,0.08)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: 360, height: 360, borderRadius: '50%',
            border: '1px solid rgba(26,79,255,0.06)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }} />

          <img
            src={logo}
            alt="Inventory Control"
            style={{ width: '100%', maxWidth: 300, height: 'auto', objectFit: 'contain', position: 'relative', zIndex: 1 }}
          />

          <p
            className="font-mono text-center"
            style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.2em', marginTop: '2rem', position: 'relative', zIndex: 1 }}
          >
            INVENTORY MANAGEMENT SYSTEM
          </p>
        </div>

        {/* ── RIGHT: Login form ── */}
        <div
          className="flex flex-col justify-center"
          style={{ background: '#13131f', padding: '3rem 2.5rem' }}
        >
          <h2
            className="font-syne font-extrabold text-white"
            style={{ fontSize: 28, marginBottom: '0.4rem' }}
          >
            Welcome back
          </h2>
          <p
            className="font-mono"
            style={{ color: '#5a5a7a', fontSize: 13, marginBottom: '2rem', letterSpacing: '0.04em' }}
          >
            Sign in to your account
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="block font-mono" style={{ color: '#5a5a7a', fontSize: 12, letterSpacing: '0.1em', marginBottom: 8 }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl outline-none transition-all"
                style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0', fontSize: 15, padding: '12px 16px' }}
                onFocus={e => e.target.style.borderColor = '#1a4fff'}
                onBlur={e => e.target.style.borderColor = '#2a2a3e'}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block font-mono" style={{ color: '#5a5a7a', fontSize: 12, letterSpacing: '0.1em', marginBottom: 8 }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl outline-none transition-all"
                style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0', fontSize: 15, padding: '12px 16px' }}
                onFocus={e => e.target.style.borderColor = '#1a4fff'}
                onBlur={e => e.target.style.borderColor = '#2a2a3e'}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl" style={{ background: '#2d0f0f', color: '#f87171', border: '1px solid #4a1a1a', fontSize: 14, padding: '10px 14px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1a4fff', fontSize: 16, padding: '13px 0', marginTop: '0.25rem' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick login */}
          <div style={{ borderTop: '1px solid #2a2a3e', marginTop: '1.75rem', paddingTop: '1.5rem' }}>
            <p className="font-mono" style={{ color: '#5a5a7a', fontSize: 11, letterSpacing: '0.1em', marginBottom: '0.85rem' }}>
              QUICK LOGIN (DEMO)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u)}
                  className="w-full flex items-center justify-between rounded-xl transition-colors hover:opacity-80"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', padding: '10px 14px' }}
                >
                  <span className="font-medium" style={{ color: '#c0c0e0', fontSize: 15 }}>{u.name}</span>
                  <span
                    className="font-mono rounded"
                    style={{
                      fontSize: 11, padding: '3px 10px',
                      background: u.role === 'admin' ? '#1a2a5e' : u.role === 'manager' ? '#1a3a2e' : '#2a2a1a',
                      color: u.role === 'admin' ? '#6090ff' : u.role === 'manager' ? '#4ade80' : '#f8c94e',
                    }}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}