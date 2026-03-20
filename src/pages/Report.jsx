import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { SYMPTOMS, COLORS } from '../lib/constants'

export default function Report() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [meds, setMeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [cycle, setCycle] = useState('all')

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('symptom_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: true }).limit(200),
      supabase.from('medications').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
    ]).then(([l, m]) => {
      if (l.data) setLogs(l.data)
      if (m.data) setMeds(m.data)
      setLoading(false)
    })
  }, [user])

  const cycles = [...new Set(logs.filter(l => l.cycle_number).map(l => l.cycle_number))].sort((a, b) => a - b)
  const filtered = cycle === 'all' ? logs : logs.filter(l => l.cycle_number === parseInt(cycle))
  const userName = user?.user_metadata?.full_name || 'Patient'
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Compute stats
  const computeStats = (data) => {
    if (data.length === 0) return null
    const stats = {}
    SYMPTOMS.forEach(s => {
      const vals = data.map(l => l.symptoms?.[s.key] ?? 0)
      stats[s.key] = {
        avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
        max: Math.max(...vals),
        min: Math.min(...vals),
        latest: vals[vals.length - 1],
        trend: vals.length >= 3 ? (
          vals.slice(-3).reduce((a, b) => a + b, 0) / 3 - vals.slice(0, 3).reduce((a, b) => a + b, 0) / 3
        ).toFixed(1) : null,
      }
    })
    return stats
  }

  const stats = computeStats(filtered)
  const dateRange = filtered.length > 0
    ? `${new Date(filtered[0].log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(filtered[filtered.length - 1].log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : ''

  // Notes from this period
  const notesEntries = filtered.filter(l => l.notes).slice(-5)

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F2' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .report-body { padding: 0 !important; max-width: none !important; }
          .report-page { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* Nav — hidden on print */}
      <nav className="no-print" style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>C</div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--text)' }}>ChemoLog</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {cycles.length > 0 && (
            <select value={cycle} onChange={e => setCycle(e.target.value)} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
              fontSize: 14, background: '#fff', fontFamily: "'DM Sans'",
            }}>
              <option value="all">All cycles</option>
              {cycles.map(c => <option key={c} value={c}>Cycle {c}</option>)}
            </select>
          )}
          <button onClick={() => window.print()} style={{
            fontSize: 14, fontWeight: 600, background: 'var(--accent)', color: '#fff',
            padding: '8px 20px', borderRadius: 8, border: 'none',
          }}>🖨 Print / Save as PDF</button>
          <Link to="/dashboard" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>← Dashboard</Link>
        </div>
      </nav>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading report...</div>
      ) : !stats ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No data for selected period.</div>
      ) : (
        <div className="report-body" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
          <div className="report-page" style={{
            background: '#fff', borderRadius: 16, padding: '48px 40px',
            border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 24, borderBottom: '2px solid var(--accent)' }}>
              <div>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, fontWeight: 400, marginBottom: 4 }}>
                  ChemoLog — Symptom Report
                </h1>
                <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>
                  Prepared for <strong>{userName}</strong> · {today}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
                <div>{filtered.length} entries logged</div>
                <div>{dateRange}</div>
                {cycle !== 'all' && <div style={{ fontWeight: 600, color: 'var(--accent)' }}>Cycle {cycle}</div>}
              </div>
            </div>

            {/* Active medications */}
            {meds.filter(m => !m.end_date).length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 10 }}>Current medications</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {meds.filter(m => !m.end_date).map(m => (
                    <span key={m.id} style={{
                      fontSize: 13, fontWeight: 600, background: 'var(--accent-light)', color: 'var(--accent-dark)',
                      padding: '5px 14px', borderRadius: 8, border: '1px solid #2A9D8F22',
                    }}>
                      {m.drug_name}{m.dosage ? ` · ${m.dosage}` : ''}{m.frequency ? ` · ${m.frequency}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Symptom summary table */}
            <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 12 }}>Symptom summary</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28, fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E8E8E4' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Symptom</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>Average</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>Peak</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>Latest</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {SYMPTOMS.map((s, i) => {
                  const st = stats[s.key]
                  const trend = st.trend !== null ? parseFloat(st.trend) : null
                  return (
                    <tr key={s.key} style={{ borderBottom: '1px solid #F0F0EE' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.emoji} {s.label}</td>
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                        <span style={{
                          fontWeight: 700, color: parseFloat(st.avg) >= 7 ? 'var(--coral)' : parseFloat(st.avg) >= 4 ? '#D97706' : 'var(--accent)',
                        }}>{st.avg}</span>/10
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                        <span style={{ fontWeight: 600, color: st.max >= 7 ? 'var(--coral)' : 'var(--text)' }}>{st.max}</span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>{st.latest}</td>
                      <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                        {trend !== null ? (
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                            background: trend > 0.5 ? '#FEF2F2' : trend < -0.5 ? '#E6F5F3' : '#F5F5F3',
                            color: trend > 0.5 ? 'var(--coral)' : trend < -0.5 ? 'var(--accent)' : 'var(--text-muted)',
                          }}>
                            {trend > 0.5 ? `↑ worse` : trend < -0.5 ? `↓ better` : '→ stable'}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Visual bars */}
            <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 12 }}>Severity overview</h3>
            <div style={{ marginBottom: 28 }}>
              {SYMPTOMS.map((s, i) => {
                const avg = parseFloat(stats[s.key].avg)
                return (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 100, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>{s.label}</div>
                    <div style={{ flex: 1, height: 12, background: '#F0F0EE', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${avg * 10}%`, height: '100%', background: COLORS[i], borderRadius: 6, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ width: 36, textAlign: 'right', fontSize: 13, fontWeight: 700 }}>{stats[s.key].avg}</div>
                  </div>
                )
              })}
            </div>

            {/* Patient notes */}
            {notesEntries.length > 0 && (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 12 }}>Patient notes (recent)</h3>
                <div style={{ marginBottom: 28 }}>
                  {notesEntries.map((l, i) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: i < notesEntries.length - 1 ? '1px solid #F0F0EE' : 'none' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3 }}>
                        {new Date(l.log_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {l.cycle_number ? ` · Cycle ${l.cycle_number}` : ''}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>"{l.notes}"</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Footer */}
            <div style={{ borderTop: '1px solid #E8E8E4', paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>
                Generated by ChemoLog · chemolog-app.vercel.app<br />
                This is a patient-generated report, not a clinical document.
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right' }}>
                {today}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
