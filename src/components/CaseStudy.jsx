import DashboardMockup from './DashboardMockup.jsx'

const STACK_COLORS = {
  'React Vite': '#61dafb',
  'PHP':        '#777bb4',
  'MySQL':      '#4479a1',
  'TailwindCSS':'#38bdf8',
  'REST API':   '#e34f26',
  'JWT Auth':   '#f7931e',
}

const FEATURE_ICONS = {
  'scan':         'ti-scan',
  'shield-check': 'ti-shield-check',
  'bell-ringing': 'ti-bell-ringing',
  'file-invoice': 'ti-file-invoice',
  'chart-bar':    'ti-chart-bar',
  'table-export': 'ti-table-export',
}

export default function CaseStudy({ data }) {
  const allTech = [...data.tech, 'REST API', 'JWT Auth']

  return (
    <main className="bg-[#fafaf8] min-h-screen">
      <article className="max-w-[860px] mx-auto px-8 py-12 pb-24">

        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className="text-[11px] tracking-widest"
            style={{ fontFamily: 'DM Mono, monospace', color: '#767676' }}
          >
            {data.number}
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#767676]" />
          <span
            className="text-[10px] tracking-widest px-3 py-1 rounded-full border"
            style={{
              fontFamily: 'DM Mono, monospace',
              background: '#e8f5e0',
              color: '#2d6a12',
              borderColor: '#baded6',
            }}
          >
            ✦ SHIPPED
          </span>
        </div>

        <h1
          className="font-syne leading-[1.05] tracking-[-0.03em] mb-3"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 800 }}
        >
          Stock<span className="text-[#1a4fff]">Master</span>
          <br />Pro
        </h1>

        <p className="text-[1.05rem] leading-relaxed mb-10 max-w-[520px]" style={{ color: '#767676' }}>
          {data.description}
        </p>

        {/* ── Meta strip ───────────────────────────────────── */}
        <div
          className="flex flex-wrap gap-8 py-5 mb-12 border-y"
          style={{ borderColor: '#e8e6e0' }}
        >
          {[
            { label: 'Year',   value: data.year     },
            { label: 'Role',   value: data.role     },
            { label: 'Type',   value: data.category },
            { label: 'Status', value: data.status   },
          ].map((m) => (
            <div key={m.label}>
              <span
                className="block text-[10px] tracking-[0.12em] mb-1 uppercase"
                style={{ fontFamily: 'DM Mono, monospace', color: '#767676' }}
              >
                {m.label}
              </span>
              <span className="text-[0.9rem] font-semibold text-[#0f0f0f]">{m.value}</span>
            </div>
          ))}
        </div>

        {/* ── Dashboard Mockup ─────────────────────────────── */}
        <DashboardMockup data={data} />

        {/* ── Overview ─────────────────────────────────────── */}
        <SectionLabel>Overview</SectionLabel>
        <div className="mb-12 max-w-[680px] space-y-4">
          {data.overview.map((p, i) => (
            <p key={i} className="text-[1.05rem] leading-[1.8]" style={{ color: '#3a3a3a' }}>{p}</p>
          ))}
        </div>

        {/* ── Numbers ──────────────────────────────────────── */}
        <div
          className="grid grid-cols-3 gap-px rounded-xl overflow-hidden mb-12 border"
          style={{ background: '#e8e6e0', borderColor: '#e8e6e0' }}
        >
          {[
            { val: '2,800+', unit: 'SKUs',   label: 'managed in production'    },
            { val: '3',      unit: 'roles',  label: 'Admin / Manager / Staff'  },
            { val: '<200',   unit: 'ms',     label: 'average API response time' },
          ].map((n) => (
            <div key={n.label} className="bg-white text-center py-6 px-4">
              <div className="font-syne font-extrabold leading-none" style={{ fontSize: '2.2rem' }}>
                {n.val}
                <span className="text-[0.8rem] font-semibold text-[#1a4fff] ml-1">{n.unit}</span>
              </div>
              <div className="text-[0.75rem] mt-1" style={{ color: '#767676' }}>{n.label}</div>
            </div>
          ))}
        </div>

        {/* ── Features ─────────────────────────────────────── */}
        <SectionLabel>Key Features</SectionLabel>
        <div className="grid grid-cols-3 gap-3 mb-12">
          {data.features.map((f) => (
            <div
              key={f.title}
              className="bg-white border rounded-xl p-5"
              style={{ borderColor: '#e8e6e0' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: '#eef2ff' }}
              >
                <i className={`ti ${FEATURE_ICONS[f.icon]}`} style={{ color: '#1a4fff', fontSize: 16 }} />
              </div>
              <div className="text-[0.85rem] font-bold mb-1">{f.title}</div>
              <div className="text-[0.78rem] leading-[1.5]" style={{ color: '#767676' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Tech Stack ───────────────────────────────────── */}
        <SectionLabel>Tech Stack</SectionLabel>
        <div className="flex flex-wrap gap-2 mb-12">
          {allTech.map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 border rounded-md px-3 py-[5px] text-[0.8rem] font-semibold"
              style={{ background: '#f0f0ec', borderColor: '#e8e6e0', color: '#3a3a3a' }}
            >
              <span
                className="w-[7px] h-[7px] rounded-full"
                style={{ background: STACK_COLORS[t] || '#999' }}
              />
              {t}
            </div>
          ))}
        </div>

        {/* ── Build Timeline ───────────────────────────────── */}
        <SectionLabel>Build Timeline</SectionLabel>
        <div className="mb-12 pl-6 relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-px"
            style={{ background: '#e8e6e0' }}
          />
          {data.buildTimeline.map((item, i) => (
            <div key={i} className="relative mb-6 last:mb-0">
              <span
                className="absolute -left-6 top-[5px] w-[9px] h-[9px] rounded-full translate-x-[-4px]"
                style={{ background: item.accent ? '#ff4f1a' : '#1a4fff' }}
              />
              <div
                className="text-[0.65rem] tracking-[0.1em] mb-[2px] uppercase"
                style={{ fontFamily: 'DM Mono, monospace', color: '#1a4fff' }}
              >
                {item.phase}
              </div>
              <div className="text-[0.9rem] font-bold mb-[3px]">{item.title}</div>
              <div className="text-[0.8rem] leading-[1.5]" style={{ color: '#767676' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Challenges ───────────────────────────────────── */}
        <SectionLabel>Challenges & Solutions</SectionLabel>
        <div className="grid grid-cols-2 gap-3 mb-12">
          {data.challenges.map((c, i) => (
            <div key={i} className="contents">
              <div className="bg-white border rounded-xl p-5" style={{ borderColor: '#e8e6e0' }}>
                <span
                  className="inline-block text-[0.65rem] tracking-widest px-2 py-[2px] rounded mb-3"
                  style={{ fontFamily: 'DM Mono, monospace', background: '#fff0ee', color: '#ff4f1a' }}
                >
                  PROBLEM
                </span>
                <p className="text-[0.82rem] leading-[1.6]" style={{ color: '#3a3a3a' }}>{c.problem}</p>
              </div>
              <div className="bg-white border rounded-xl p-5" style={{ borderColor: '#e8e6e0' }}>
                <span
                  className="inline-block text-[0.65rem] tracking-widest px-2 py-[2px] rounded mb-3"
                  style={{ fontFamily: 'DM Mono, monospace', background: '#eef2ff', color: '#1a4fff' }}
                >
                  SOLUTION
                </span>
                <p className="text-[0.82rem] leading-[1.6]" style={{ color: '#3a3a3a' }}>{c.solution}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Links ────────────────────────────────────────── */}
        <SectionLabel>Links</SectionLabel>
        <div className="flex gap-3 flex-wrap">
          {data.links.github && (
            <a
              href={data.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[0.85rem] font-semibold no-underline transition-opacity hover:opacity-80"
              style={{ background: '#f0f0ec', color: '#0f0f0f', border: '0.5px solid #e8e6e0' }}
            >
              <i className="ti ti-brand-github" />
              GitHub
            </a>
          )}
          {data.links.live ? (
            <a
              href={data.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[0.85rem] font-semibold no-underline transition-opacity hover:opacity-80"
              style={{ background: '#1a4fff', color: '#fff' }}
            >
              <i className="ti ti-external-link" />
              Live Demo
            </a>
          ) : (
            <span
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[0.85rem] font-semibold"
              style={{ background: '#f0f0ec', color: '#767676', border: '0.5px solid #e8e6e0', cursor: 'not-allowed' }}
            >
              <i className="ti ti-external-link" />
              Live Demo — coming soon
            </span>
          )}
        </div>

      </article>
    </main>
  )
}

function SectionLabel({ children }) {
  return (
    <div
      className="text-[11px] tracking-[0.12em] mb-3 uppercase"
      style={{ fontFamily: 'DM Mono, monospace', color: '#1a4fff' }}
    >
      {children}
    </div>
  )
}
