import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function Medications() {
  const { user } = useAuth()
  const [meds, setMeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ drug_name: '', dosage: '', frequency: '', start_date: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchMeds() }, [user])

  const fetchMeds = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
    if (!error && data) setMeds(data)
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.drug_name.trim()) { setError('Drug name is required'); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('medications').insert({
      user_id: user.id,
      drug_name: form.drug_name.trim(),
      dosage: form.dosage.trim() || null,
      frequency: form.frequency.trim() || null,
      start_date: form.start_date || null,
      notes: form.notes.trim() || null,
    })
    if (err) {
      setError(err.message)
    } else {
      setForm({ drug_name: '', dosage: '', frequency: '', start_date: '', notes: '' })
      setShowForm(false)
      fetchMeds()
    }
    setSaving(false)
  }

  const handleEnd = async (id) => {
    await supabase.from('medications').update({ end_date: new Date().toISOString().split('T')[0] }).eq('id', id)
    fetchMeds()
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this medication?')) return
    await supabase.from('medications').delete().eq('id', id)
    fetchMeds()
  }

  const active = meds.filter(m => !m.end_date)
  const past = meds.filter(m => m.end_date)

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F2' }}>
      <nav style={{
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
        <Link to="/dashboard" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 4 }}>Medications</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Track your chemo regimen, dosages, and timeline.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            fontSize: 14, fontWeight: 600, background: showForm ? '#F0F0EE' : 'var(--accent)',
            color: showForm ? 'var(--text-muted)' : '#fff',
            padding: '10px 20px', borderRadius: 10, border: 'none',
          }}>{showForm ? 'Cancel' : '+ Add medication'}</button>
        </div>

        {/* Add form */}
        {showForm && (
          <div style={{
            background: 'var(--card)', borderRadius: 18, padding: '28px 24px',
            border: '1px solid var(--border)', marginBottom: 24,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Drug name *</label>
                <input style={inp} placeholder="e.g. Carboplatin" value={form.drug_name} onChange={e => setForm(p => ({ ...p, drug_name: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Dosage</label>
                <input style={inp} placeholder="e.g. 300mg/m²" value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Frequency</label>
                <input style={inp} placeholder="e.g. Every 3 weeks" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Start date</label>
                <input style={inp} type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Notes (optional)</label>
              <input style={inp} placeholder="e.g. Part of TC regimen" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            {error && <div style={{ fontSize: 14, color: '#DC2626', marginBottom: 12 }}>{error}</div>}
            <button onClick={handleAdd} disabled={saving} style={{
              width: '100%', padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 600,
              background: 'var(--accent)', color: '#fff', opacity: saving ? 0.7 : 1, border: 'none',
            }}>{saving ? 'Adding...' : 'Add medication'}</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading...</div>
        ) : meds.length === 0 && !showForm ? (
          <div style={{
            background: 'var(--card)', borderRadius: 20, padding: '60px 32px',
            border: '1px solid var(--border)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💊</div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 10, fontWeight: 400 }}>No medications logged</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 340, margin: '0 auto 20px' }}>
              Add your chemo drugs to track your regimen alongside symptoms.
            </p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 12 }}>Active</h3>
                {active.map(m => <MedCard key={m.id} med={m} onEnd={handleEnd} onDelete={handleDelete} />)}
              </>
            )}
            {past.length > 0 && (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginTop: 28, marginBottom: 12 }}>Past</h3>
                {past.map(m => <MedCard key={m.id} med={m} onEnd={handleEnd} onDelete={handleDelete} past />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MedCard({ med, onEnd, onDelete, past }) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 14, padding: '20px',
      border: '1px solid var(--border)', marginBottom: 12,
      opacity: past ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
            💊 {med.drug_name}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
            {med.dosage && <span>{med.dosage}</span>}
            {med.frequency && <span>{med.frequency}</span>}
            {med.start_date && <span>Started {new Date(med.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            {med.end_date && <span>Ended {new Date(med.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          </div>
          {med.notes && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>{med.notes}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {!past && (
            <button onClick={() => onEnd(med.id)} style={{
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
              background: '#FEF8E8', color: '#D97706', border: 'none',
            }}>End</button>
          )}
          <button onClick={() => onDelete(med.id)} style={{
            fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
            background: '#FEF2F2', color: '#DC2626', border: 'none',
          }}>Remove</button>
        </div>
      </div>
    </div>
  )
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }
const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border)',
  fontSize: 15, outline: 'none', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif",
}
