import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import logo from '../../public/inventorycontrol_logo.png'

// ─── Login Modal ──────────────────────────────────────────────────────────────
function LoginModal({ onClose }) {
  const { dispatch, USERS } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

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
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      width: '100vw', height: '100vh',
      zIndex: 9999,
      background: 'rgba(6,12,28,0.72)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'lp_fadeIn 0.18s ease',
      boxSizing: 'border-box',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: 20,
          padding: '2.25rem 2rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.08)',
          animation: 'lp_slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: '#f3f4f6', border: 'none', borderRadius: 8,
          width: 32, height: 32, cursor: 'pointer',
          fontSize: 16, color: '#6b7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        {/* Logo header */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={logo}
            alt="Inventory Control"
            style={{ height: 160, width: 'auto', objectFit: 'contain', marginBottom: 10 }}
          />
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Sign in to your workspace</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: '100%', borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                background: '#f9fafb', color: '#111827',
                fontSize: 14, padding: '11px 14px',
                outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#1a3fd4'; e.target.style.boxShadow = '0 0 0 3px rgba(26,63,212,0.12)' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                background: '#f9fafb', color: '#111827',
                fontSize: 14, padding: '11px 14px',
                outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#1a3fd4'; e.target.style.boxShadow = '0 0 0 3px rgba(26,63,212,0.12)' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: 8, fontSize: 13, padding: '10px 14px',
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', borderRadius: 10,
              background: 'linear-gradient(135deg, #1a3fd4, #0ea5e9)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              padding: '12px 0', marginTop: 4,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s, transform 0.1s',
              boxShadow: '0 4px 16px rgba(26,63,212,0.35)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.7' : '1'; e.currentTarget.style.transform = 'none' }}
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        {/* Quick login */}
        <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
          <p style={{
            fontSize: 10, color: '#9ca3af', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 10, fontWeight: 600,
          }}>
            Demo accounts — click to fill
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {USERS.map(u => {
              const roleStyle = {
                admin:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
                manager: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
                staff:   { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
              }[u.role]
              return (
                <button
                  key={u.id}
                  onClick={() => quickLogin(u)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f9fafb', border: '1px solid #f3f4f6',
                    borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#f3f4f6' }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block' }}>{u.name}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{u.email}</span>
                  </div>
                  <span style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 5,
                    background: roleStyle.bg, color: roleStyle.color,
                    border: `1px solid ${roleStyle.border}`,
                    fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    {u.role}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, accent = '#1a3fd4' }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#ffffff' : '#f8faff',
        border: `1.5px solid ${hovered ? accent : '#e8edf8'}`,
        borderRadius: 16, padding: '1.75rem',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? `0 8px 32px rgba(26,63,212,0.12)` : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `linear-gradient(135deg, ${accent}18, ${accent}30)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, marginBottom: '1rem',
        border: `1px solid ${accent}22`,
      }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f1729', marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  )
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ plan, price, period, features, highlight, onCTA, ctaLabel }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: highlight ? 'linear-gradient(145deg, #1a3fd4, #0c2aaa)' : '#ffffff',
        border: highlight ? 'none' : '1.5px solid #e5e9f5',
        borderRadius: 20, padding: '2rem',
        position: 'relative', overflow: 'hidden',
        boxShadow: highlight
          ? '0 20px 60px rgba(26,63,212,0.35)'
          : hovered ? '0 8px 32px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
        transform: highlight ? 'scale(1.04)' : hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.22s ease',
        flex: '1 1 280px', maxWidth: 340,
      }}
    >
      {highlight && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
        }} />
      )}
      {highlight && (
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.15)',
          color: '#e0e7ff', fontSize: 11, fontWeight: 700,
          padding: '4px 12px', borderRadius: 20,
          marginBottom: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>Most Popular</div>
      )}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: highlight ? '#93c5fd' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{plan}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: highlight ? '#93c5fd' : '#9ca3af', marginTop: 8 }}>₱</span>
          <span style={{ fontSize: 44, fontWeight: 900, color: highlight ? '#ffffff' : '#0f1729', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{price}</span>
          <span style={{ fontSize: 14, color: highlight ? '#93c5fd' : '#9ca3af' }}>{period}</span>
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: highlight ? '#c7d7fe' : '#374151' }}>
            <span style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
              background: highlight ? 'rgba(255,255,255,0.15)' : '#eff3ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
              color: highlight ? '#93c5fd' : '#1a3fd4',
            }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onCTA}
        style={{
          width: '100%', padding: '12px',
          borderRadius: 10, border: 'none',
          background: highlight ? '#ffffff' : 'linear-gradient(135deg, #1a3fd4, #0ea5e9)',
          color: highlight ? '#1a3fd4' : '#ffffff',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.15s',
          boxShadow: highlight ? 'none' : '0 4px 14px rgba(26,63,212,0.3)',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(0.98)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
      >
        {ctaLabel}
      </button>
    </div>
  )
}

function StatBadge({ num, label }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 2rem' }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: '#0f1729', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{num}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{label}</div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [billingAnnual, setBillingAnnual] = useState(false)

  // Fix: override the app-level overflow:hidden & height:100% on body/#root
  // so this page can scroll normally
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyHeight = document.body.style.height
    const prevRootHeight = document.getElementById('root')?.style.height
    const prevRootOverflow = document.getElementById('root')?.style.overflow

    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    if (document.getElementById('root')) {
      document.getElementById('root').style.height = 'auto'
      document.getElementById('root').style.overflow = 'visible'
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.body.style.height = prevBodyHeight
      if (document.getElementById('root')) {
        document.getElementById('root').style.height = prevRootHeight || ''
        document.getElementById('root').style.overflow = prevRootOverflow || ''
      }
    }
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showLogin) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [showLogin])

  const prices = {
    starter: billingAnnual ? '990' : '1,199',
    growth: billingAnnual ? '2,490' : '2,990',
    enterprise: billingAnnual ? '5,490' : '6,499',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes lp_fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes lp_slideUp { from { opacity:0; transform:translateY(28px) scale(0.97) } to { opacity:1; transform:none } }
        @keyframes lp_floatBg { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(2deg)} }
        @keyframes lp_pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .lp-nav-link { font-size:14px; font-weight:500; color:#374151; text-decoration:none; transition:color 0.15s; cursor:pointer; background:none; border:none; padding:0; font-family:'DM Sans',sans-serif; }
        .lp-nav-link:hover { color:#1a3fd4; }
        @media (max-width: 768px) {
          .lp-hero-title { font-size: 2.4rem !important; }
          .lp-features-grid { grid-template-columns: 1fr !important; }
          .lp-pricing-row { flex-direction: column !important; align-items: center !important; }
          .lp-stats-row { flex-direction: column !important; gap: 1.5rem !important; }
          .lp-stats-divider { display: none !important; }
          .lp-nav-links { display: none !important; }
          .lp-hero-btns { flex-direction: column !important; align-items:center !important; }
          .lp-section { padding: 4rem 1.25rem !important; }
          .lp-hero { padding: 6rem 1.25rem 4rem !important; }
          .lp-smartscan-row { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ background: '#f5f7ff', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Navbar ── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(245,247,255,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(26,63,212,0.08)',
          padding: '0 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logo} alt="StockMaster PH" style={{ height: 100, width: 'auto', objectFit: 'contain' }} />
          </div>

          <div className="lp-nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a className="lp-nav-link" href="#features">Features</a>
            <a className="lp-nav-link" href="#pricing">Pricing</a>
            <a className="lp-nav-link" href="#smartscan">SmartScan AI</a>
            <a className="lp-nav-link" href="#faq">FAQ</a>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setShowLogin(true)} style={{
              background: 'none', border: 'none', fontSize: 14, fontWeight: 600,
              color: '#374151', cursor: 'pointer', padding: '8px 14px', fontFamily: "'DM Sans',sans-serif",
            }}>Sign in</button>
            <button onClick={() => setShowLogin(true)} style={{
              background: 'linear-gradient(135deg, #1a3fd4, #0ea5e9)',
              color: '#fff', border: 'none', borderRadius: 9,
              fontSize: 14, fontWeight: 700, padding: '9px 20px', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(26,63,212,0.3)',
              transition: 'opacity 0.15s', fontFamily: "'DM Sans',sans-serif",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Start Free Trial</button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="lp-hero" style={{
          padding: '8rem 2rem 5rem',
          maxWidth: 1160, margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 80, left: '10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,63,212,0.08) 0%, transparent 70%)',
            animation: 'lp_floatBg 8s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 120, right: '5%',
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
            animation: 'lp_floatBg 10s ease-in-out infinite reverse',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#eff3ff', border: '1px solid #c7d7fe',
            borderRadius: 20, padding: '6px 16px', marginBottom: '1.5rem',
            position: 'relative', zIndex: 1,
          }}>
            <span style={{ animation: 'lp_pulse 2s infinite', fontSize: 10 }}>🟢</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3fd4' }}>Built for Philippine businesses</span>
          </div>

          <h1 className="lp-hero-title" style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 900, color: '#0f1729',
            lineHeight: 1.08, maxWidth: 800,
            margin: '0 0 1.5rem',
            letterSpacing: '-0.02em',
            position: 'relative', zIndex: 1,
          }}>
            Inventory control that<br />
            <span style={{
              background: 'linear-gradient(135deg, #1a3fd4, #0ea5e9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>actually works for you</span>
          </h1>

          <p style={{
            fontSize: 18, color: '#4b5563', lineHeight: 1.7,
            maxWidth: 560, margin: '0 0 2.5rem',
            position: 'relative', zIndex: 1,
          }}>
            Real-time stock tracking, smart reorder alerts, purchase order management, and team collaboration — all in one clean dashboard.
          </p>

          <div className="lp-hero-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <button onClick={() => setShowLogin(true)} style={{
              background: 'linear-gradient(135deg, #1a3fd4, #0ea5e9)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 16, fontWeight: 700, padding: '14px 32px', cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(26,63,212,0.35)',
              transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(26,63,212,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(26,63,212,0.35)' }}
            >
              Start Free 14-Day Trial →
            </button>
            <button onClick={() => setShowLogin(true)} style={{
              background: '#ffffff', color: '#0f1729',
              border: '1.5px solid #e5e9f5', borderRadius: 12,
              fontSize: 16, fontWeight: 600, padding: '14px 28px', cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontFamily: "'DM Sans',sans-serif",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a3fd4'; e.currentTarget.style.color = '#1a3fd4' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e9f5'; e.currentTarget.style.color = '#0f1729' }}
            >
              View Demo
            </button>
          </div>

          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: '1rem', position: 'relative', zIndex: 1 }}>No credit card required · Cancel anytime</p>

          {/* Dashboard Preview */}
          <div style={{
            marginTop: '3.5rem', width: '100%', maxWidth: 860,
            background: '#0f1729', borderRadius: 20, padding: '1.25rem',
            boxShadow: '0 32px 80px rgba(15,23,41,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41' }} />
              <div style={{ flex: 1, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginLeft: 8, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                <span style={{ fontSize: 11, color: '#6b7280' }}>app.stockmaster.ph/dashboard</span>
              </div>
            </div>
            <div style={{ background: '#1a2237', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Total SKUs', val: '156', trend: '+12', color: '#3b82f6' },
                { label: 'Low Stock', val: '7', trend: 'Action needed', color: '#f59e0b' },
                { label: 'Pending POs', val: '4', trend: '₱48,200', color: '#10b981' },
                { label: "Today's Moves", val: '23', trend: '+8 inbound', color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} style={{
                  flex: '1 1 140px',
                  background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: s.color, margin: 0 }}>{s.trend}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section style={{ background: '#ffffff', padding: '3rem 2rem', borderTop: '1px solid #e8edf8', borderBottom: '1px solid #e8edf8' }}>
          <div className="lp-stats-row" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0', maxWidth: 900, margin: '0 auto', alignItems: 'center' }}>
            <StatBadge num="2,400+" label="Active businesses" />
            <div className="lp-stats-divider" style={{ width: 1, height: 40, background: '#e5e9f5' }} />
            <StatBadge num="₱1.2B+" label="Inventory tracked monthly" />
            <div className="lp-stats-divider" style={{ width: 1, height: 40, background: '#e5e9f5' }} />
            <StatBadge num="99.9%" label="Uptime SLA" />
            <div className="lp-stats-divider" style={{ width: 1, height: 40, background: '#e5e9f5' }} />
            <StatBadge num="4.9★" label="Average rating" />
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="lp-section" style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a3fd4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Everything you need</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, color: '#0f1729', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
              Powerful tools, zero complexity
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>Everything your warehouse, retail store, or distribution business needs in one place.</p>
          </div>
          <div className="lp-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <FeatureCard icon="📊" title="Real-Time Dashboard" desc="Live overview of stock levels, pending orders, low-stock alerts, and movement history across all your SKUs." accent="#1a3fd4" />
            <FeatureCard icon="🔔" title="Smart Reorder Alerts" desc="Automated notifications when products hit your reorder threshold — never run out of your bestsellers again." accent="#f59e0b" />
            <FeatureCard icon="📋" title="Purchase Order Management" desc="Create, track, and receive purchase orders with full audit trails. Suppliers, delivery dates, and item reconciliation built in." accent="#10b981" />
            <FeatureCard icon="📦" title="Stock Movement Tracking" desc="Full inbound/outbound log with timestamps, staff attribution, and notes. Perfect for audits and loss prevention." accent="#8b5cf6" />
            <FeatureCard icon="👥" title="Multi-User Roles" desc="Admin, manager, and staff roles with granular permissions. See who did what and when across your entire team." accent="#ec4899" />
            <FeatureCard icon="📈" title="Reports & Analytics" desc="Inventory valuation, turnover rates, movement trends, and supplier performance — exportable at any time." accent="#0ea5e9" />
          </div>
        </section>

        {/* ── SmartScan AI ── */}
        <section id="smartscan" style={{
          background: 'linear-gradient(135deg, #0f1729 0%, #1a2a5e 100%)',
          padding: '5rem 2rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -100, right: -100,
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          <div className="lp-smartscan-row" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ flex: '1 1 380px', maxWidth: 480 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)',
                borderRadius: 20, padding: '5px 14px', marginBottom: '1.5rem',
              }}>
                <span style={{ fontSize: 14 }}>✨</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>New Feature</span>
              </div>
              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900,
                color: '#f1f5f9', lineHeight: 1.1, margin: '0 0 1.25rem', letterSpacing: '-0.02em',
              }}>
                SmartScan AI<br /><span style={{ color: '#38bdf8' }}>Barcode Intelligence</span>
              </h2>
              <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                Point your device camera at any product barcode and SmartScan AI instantly identifies the item, suggests a reorder quantity based on historical sales patterns, and pre-fills the movement form — reducing data entry time by up to 80%.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Scan any EAN-13, QR, or custom barcode', 'AI-powered demand forecasting per SKU', 'Auto-suggest reorder quantities', 'Batch scan mode for receiving goods', 'Works fully offline on mobile'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#cbd5e1' }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#38bdf8', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowLogin(true)} style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', color: '#0f1729',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, padding: '12px 28px',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(14,165,233,0.4)', transition: 'all 0.15s',
                fontFamily: "'DM Sans',sans-serif",
              }}>Try SmartScan Free →</button>
            </div>

            <div style={{ flex: '1 1 300px', maxWidth: 360 }}>
              <div style={{
                background: '#1a2237', borderRadius: 20, padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>SmartScan AI</span>
                  <span style={{ fontSize: 11, background: 'rgba(14,165,233,0.2)', color: '#38bdf8', padding: '3px 10px', borderRadius: 20, fontWeight: 600, border: '1px solid rgba(14,165,233,0.3)' }}>● LIVE</span>
                </div>
                <div style={{ background: '#0f1729', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem', position: 'relative' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                  <div style={{ position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, border: '2px solid rgba(14,165,233,0.4)', borderRadius: 8, animation: 'lp_pulse 2s infinite' }} />
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Point at barcode</p>
                </div>
                <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, padding: '1rem' }}>
                  <p style={{ fontSize: 10, color: '#38bdf8', margin: '0 0 6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Detected</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px' }}>USB-C Hub 7-Port</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>SKU: EL-0042 · 4 in stock</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 7, padding: '6px 10px' }}>
                      <p style={{ fontSize: 10, color: '#fbbf24', margin: 0, fontWeight: 600 }}>AI Suggests</p>
                      <p style={{ fontSize: 16, color: '#f59e0b', margin: 0, fontWeight: 800 }}>+50 units</p>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 7, padding: '6px 10px' }}>
                      <p style={{ fontSize: 10, color: '#34d399', margin: 0, fontWeight: 600 }}>Confidence</p>
                      <p style={{ fontSize: 16, color: '#10b981', margin: 0, fontWeight: 800 }}>94%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="lp-section" style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a3fd4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Pricing</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, color: '#0f1729', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 440, margin: '0 auto 1.75rem' }}>All plans include a 14-day free trial. No credit card required.</p>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: 30, padding: 4 }}>
              <button onClick={() => setBillingAnnual(false)} style={{
                padding: '8px 20px', borderRadius: 26, border: 'none', cursor: 'pointer',
                background: !billingAnnual ? '#ffffff' : 'transparent',
                color: !billingAnnual ? '#0f1729' : '#6b7280',
                fontWeight: 600, fontSize: 13, boxShadow: !billingAnnual ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s', fontFamily: "'DM Sans',sans-serif",
              }}>Monthly</button>
              <button onClick={() => setBillingAnnual(true)} style={{
                padding: '8px 20px', borderRadius: 26, border: 'none', cursor: 'pointer',
                background: billingAnnual ? '#ffffff' : 'transparent',
                color: billingAnnual ? '#0f1729' : '#6b7280',
                fontWeight: 600, fontSize: 13, boxShadow: billingAnnual ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans',sans-serif",
              }}>
                Annual
                {billingAnnual && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>–17%</span>}
              </button>
            </div>
          </div>

          <div className="lp-pricing-row" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <PricingCard plan="Starter" price={prices.starter} period="/mo"
              features={['Up to 3 users', 'Up to 500 SKUs', 'Basic dashboard & alerts', 'Stock movement logs', 'CSV export', 'Email support']}
              onCTA={() => setShowLogin(true)} ctaLabel="Start Free Trial" />
            <PricingCard plan="Growth" price={prices.growth} period="/mo" highlight
              features={['Up to 15 users', 'Unlimited SKUs', 'SmartScan AI (500 scans/mo)', 'Purchase order management', 'Advanced reports & analytics', 'Multi-warehouse support', 'Priority support']}
              onCTA={() => setShowLogin(true)} ctaLabel="Get Growth Plan" />
            <PricingCard plan="Enterprise" price={prices.enterprise} period="/mo"
              features={['Unlimited users', 'Unlimited SKUs + warehouses', 'SmartScan AI (unlimited)', 'Custom integrations & API access', 'Dedicated account manager', 'SLA guarantee', 'On-site training']}
              onCTA={() => setShowLogin(true)} ctaLabel="Contact Sales" />
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: '2rem' }}>
            Prices in Philippine Peso (₱). VAT may apply. Annual plans billed once yearly.
          </p>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ background: '#f0f4ff', padding: '5rem 2rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#0f1729', margin: 0 }}>
                Trusted by businesses across the Philippines
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { quote: "We cut stockout incidents by 70% in our first month. The reorder alerts alone paid for the subscription.", name: "Maria Santos", role: "Operations Manager", company: "BizHub Cebu" },
                { quote: "SmartScan AI is a game-changer for our receiving team. What used to take 2 hours now takes 20 minutes.", name: "Renz Lacson", role: "Warehouse Supervisor", company: "FastFreight Manila" },
                { quote: "Finally an inventory tool designed for how Filipino businesses actually operate. The peso pricing and local support are big pluses.", name: "Trisha Gomez", role: "Owner", company: "T&G General Merchandise" },
              ].map((t, i) => (
                <div key={i} style={{ flex: '1 1 280px', maxWidth: 340, background: '#ffffff', borderRadius: 16, padding: '1.75rem', border: '1.5px solid #e8edf8', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 24, color: '#1a3fd4', marginBottom: '1rem' }}>❝</div>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '0 0 1.25rem' }}>{t.quote}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #1a3fd4, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 800 }}>{t.name[0]}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f1729', margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{t.role} · {t.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="lp-section" style={{ padding: '5rem 2rem', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#0f1729', margin: 0 }}>Frequently asked questions</h2>
          </div>
          {[
            { q: 'Is there a free trial?', a: 'Yes — all plans come with a 14-day free trial. No credit card required to start.' },
            { q: 'Can I have multiple warehouses?', a: 'Multi-warehouse support is available on the Growth and Enterprise plans. Each warehouse has its own stock ledger and can share SKUs.' },
            { q: 'How does SmartScan AI work?', a: 'SmartScan uses your device camera to read barcodes, then cross-references your product catalog and analyzes recent sales velocity to recommend reorder quantities with a confidence score.' },
            { q: 'Can I import my existing product list?', a: 'Yes. You can import products via CSV on all plans. Our onboarding team can also help migrate data from spreadsheets or other systems.' },
            { q: 'Is my data secure?', a: 'All data is encrypted in transit and at rest. We are hosted on AWS (Singapore region) with daily backups and a 99.9% uptime SLA.' },
          ].map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </section>

        {/* ── CTA Banner ── */}
        <section style={{ background: 'linear-gradient(135deg, #1a3fd4, #0c2aaa)', padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem' }}>Start managing smarter today</h2>
          <p style={{ fontSize: 16, color: '#93c5fd', marginBottom: '2rem' }}>Join 2,400+ Philippine businesses already on StockMaster PH.</p>
          <button onClick={() => setShowLogin(true)} style={{
            background: '#ffffff', color: '#1a3fd4', border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 800, padding: '14px 36px', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(0,0,0,0.2)', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)' }}
          >Get Started Free →</button>
        </section>

        {/* ── Footer ── */}
        <footer style={{ background: '#0f1729', padding: '3rem 2rem', color: '#6b7280' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <img src={logo} alt="StockMaster PH" style={{ height: 150, width: 'auto', objectFit: 'contain', marginBottom: 12, filter: 'brightness(0) invert(1)' }} />
              <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 240, margin: 0 }}>Inventory management built for Philippine businesses. Simple, powerful, local.</p>
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Product</p>
                {['Features', 'Pricing', 'SmartScan AI', 'Changelog'].map(l => <p key={l} style={{ fontSize: 13, margin: '0 0 8px', cursor: 'pointer', color: '#6b7280' }}>{l}</p>)}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Company</p>
                {['About', 'Blog', 'Careers', 'Contact'].map(l => <p key={l} style={{ fontSize: 13, margin: '0 0 8px', cursor: 'pointer', color: '#6b7280' }}>{l}</p>)}
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 1100, margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: 12, margin: 0 }}>© 2026 StockMaster PH. All rights reserved.</p>
            <p style={{ fontSize: 12, margin: 0 }}>Privacy Policy · Terms of Service</p>
          </div>
        </footer>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}

// Separate component so useState works per-item
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #e8edf8' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '1.25rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans',sans-serif" }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#0f1729' }}>{q}</span>
        <span style={{ fontSize: 20, color: '#9ca3af', transition: 'transform 0.15s', transform: open ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 16 }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: '1.25rem', fontSize: 14, color: '#4b5563', lineHeight: 1.7, animation: 'lp_fadeIn 0.15s ease' }}>
          {a}
        </div>
      )}
    </div>
  )
}
