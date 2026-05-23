import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d14' }}>
      <div className="w-full max-w-sm px-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1a4fff' }}>
              <i className="ti ti-package text-white" style={{ fontSize: 18 }} />
            </div>
            <span className="font-syne text-2xl font-extrabold tracking-tight text-white">
              Stock<span style={{ color: '#1a4fff' }}>Master</span> Pro
            </span>
          </div>
          <p className="font-mono text-xs" style={{ color: '#5a5a7a' }}>INVENTORY MANAGEMENT SYSTEM</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8" style={{ background: '#13131f', borderColor: '#2a2a3e' }}>
          <h2 className="font-syne font-bold text-lg mb-6 text-white">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-xs mb-2" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                onFocus={e => e.target.style.borderColor = '#1a4fff'}
                onBlur={e => e.target.style.borderColor = '#2a2a3e'}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs mb-2" style={{ color: '#5a5a7a', letterSpacing: '0.08em' }}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e2e2f0' }}
                onFocus={e => e.target.style.borderColor = '#1a4fff'}
                onBlur={e => e.target.style.borderColor = '#2a2a3e'}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-xs rounded-lg px-3 py-2" style={{ background: '#2d0f0f', color: '#f87171', border: '1px solid #4a1a1a' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#1a4fff' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick login */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid #2a2a3e' }}>
            <p className="font-mono text-xs mb-3" style={{ color: '#5a5a7a', letterSpacing: '0.06em' }}>QUICK LOGIN (DEMO)</p>
            <div className="space-y-2">
              {USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors hover:opacity-80"
                  style={{ background: '#1a1a2e', color: '#9090b8', border: '1px solid #2a2a3e' }}
                >
                  <span className="font-medium" style={{ color: '#c0c0e0' }}>{u.name}</span>
                  <span
                    className="font-mono px-2 py-0.5 rounded text-[10px]"
                    style={{
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