import { useState } from 'react'
import { Link } from 'react-router-dom'

const GUIDES = [
  {
    key: 'nausea',
    emoji: '🤢',
    name: 'Nausea & Vomiting',
    prevalence: '60–80% of chemo patients',
    timing: 'Usually peaks 24–48 hours post-infusion. Anticipatory nausea can start before treatment.',
    cause: 'Chemotherapy drugs trigger the vomiting center in the brain and irritate the GI tract. Certain drugs (cisplatin, doxorubicin) are more emetogenic than others.',
    management: [
      'Anti-emetics (ondansetron, granisetron) are usually prescribed — take them on schedule, not just when nausea starts',
      'Eat small, frequent meals instead of large ones',
      'Avoid strong smells and spicy or fatty foods on infusion days',
      'Ginger (tea, candy, supplements) has some evidence for mild nausea',
      'Stay hydrated — small sips throughout the day',
    ],
    whenToCall: 'You can\'t keep fluids down for more than 12 hours, vomiting more than 3 times in 24 hours despite anti-emetics, or you see blood in vomit.',
    sources: ['American Cancer Society', 'National Cancer Institute'],
  },
  {
    key: 'fatigue',
    emoji: '😴',
    name: 'Fatigue',
    prevalence: '80–90% of chemo patients — the most common side effect',
    timing: 'Often worst 2–5 days post-infusion. Tends to worsen with each successive cycle. Can persist weeks to months after treatment ends.',
    cause: 'Multiple factors: the drugs themselves, anemia from suppressed bone marrow, disrupted sleep, emotional stress, poor nutrition, and the body\'s energy expenditure fighting cancer.',
    management: [
      'Light physical activity (even 10-minute walks) is shown to reduce fatigue — counterintuitive but well-studied',
      'Prioritize sleep hygiene: consistent schedule, dark room, no screens before bed',
      'Plan your most important activities for your highest-energy times of day',
      'Ask for help — delegate tasks during your low-energy days',
      'Have your care team check for anemia (low hemoglobin), which is treatable',
    ],
    whenToCall: 'Fatigue is so severe you can\'t get out of bed for daily activities, sudden onset of extreme weakness, or if accompanied by dizziness, shortness of breath, or rapid heartbeat (possible anemia).',
    sources: ['National Cancer Institute', 'NCCN Guidelines for Cancer-Related Fatigue'],
  },
  {
    key: 'neuropathy',
    emoji: '🫠',
    name: 'Peripheral Neuropathy (CIPN)',
    prevalence: '30–70% depending on the drug (highest with taxanes and platinum agents)',
    timing: 'May start during treatment or weeks after. Can persist for months to years after treatment ends in some patients.',
    cause: 'Certain chemo drugs (paclitaxel, oxaliplatin, vincristine) damage peripheral nerves. The damage can affect sensory, motor, or autonomic nerve fibers.',
    management: [
      'Report tingling or numbness early — your oncologist may adjust doses to prevent worsening',
      'Duloxetine (Cymbalta) is the only medication with strong evidence for CIPN treatment',
      'Protect hands and feet from extreme temperatures (wear gloves for cold items with oxaliplatin)',
      'Physical therapy and balance exercises can help with coordination issues',
      'Avoid alcohol, which can worsen nerve damage',
    ],
    whenToCall: 'Numbness affecting your ability to walk safely, difficulty with fine motor tasks (buttoning clothes, writing), or sudden worsening of symptoms.',
    sources: ['American Society of Clinical Oncology (ASCO)', 'Journal of Clinical Oncology — CIPN Guidelines'],
  },
  {
    key: 'pain',
    emoji: '😣',
    name: 'Pain',
    prevalence: '50–60% of patients during treatment',
    timing: 'Varies widely. Bone pain from growth factor injections peaks 1–2 days after. Mouth sores peak 7–10 days post-chemo.',
    cause: 'Can come from the cancer itself, the treatment (mucositis, injection-site reactions, bone marrow stimulation), or secondary causes like constipation or muscle tension.',
    management: [
      'Use a pain scale (0–10) consistently so your team can track changes — that\'s exactly what ChemoLog helps with',
      'Take prescribed pain medications on schedule, not just when pain becomes severe',
      'Mouth sores: gentle salt-water rinses, avoid acidic/spicy foods, use prescribed mouth rinses',
      'Bone pain from Neulasta/filgrastim: OTC antihistamines (loratadine) may help — ask your team',
      'Gentle stretching and warm compresses for muscle aches',
    ],
    whenToCall: 'Pain that is new, sudden, or severe (7+/10), pain not controlled by prescribed medications, fever combined with pain (possible infection), or pain with swelling/redness at IV site.',
    sources: ['National Comprehensive Cancer Network (NCCN)', 'American Cancer Society'],
  },
  {
    key: 'appetite_loss',
    emoji: '🍽️',
    name: 'Appetite Loss & Weight Changes',
    prevalence: '60–65% of chemo patients',
    timing: 'Usually worst in the first few days post-infusion when nausea is also high. Taste changes can persist throughout treatment.',
    cause: 'Chemo damages fast-growing cells in the mouth and GI tract, alters taste receptors, triggers nausea, and can cause mouth sores — all of which reduce desire to eat.',
    management: [
      'Small, frequent meals (5–6 per day) instead of 3 large ones',
      'Protein shakes and smoothies when solid food is unappealing',
      'Try foods at room temperature — they have less smell than hot foods',
      'Zinc supplements may help with taste changes (consult your team first)',
      'Track your weight weekly — your team needs to know about significant loss',
    ],
    whenToCall: 'You\'ve lost more than 5% of body weight without trying, unable to eat or drink for more than 24 hours, or signs of dehydration (dark urine, dizziness).',
    sources: ['American Cancer Society', 'Oncology Nursing Society'],
  },
  {
    key: 'mood',
    emoji: '😔',
    name: 'Mood Changes & Mental Health',
    prevalence: 'Up to 25% of cancer patients experience clinical depression; anxiety is even more common',
    timing: 'Can occur at any point — diagnosis, during treatment, or even after treatment ends. Steroids given with chemo (dexamethasone) can cause mood swings.',
    cause: 'A combination of the psychological burden of cancer, fatigue disrupting daily life, steroid side effects, hormonal changes, social isolation, and the direct neurological effects of some drugs.',
    management: [
      'Mental health is a medical issue, not a character flaw — tell your team if you\'re struggling',
      'Many cancer centers have dedicated psycho-oncologists or social workers',
      'Peer support groups (in-person or online) reduce isolation',
      'Physical activity has strong evidence for improving mood during chemo',
      'Mindfulness and meditation apps (Calm, Headspace) have shown benefits in cancer patients',
    ],
    whenToCall: 'Persistent feelings of hopelessness lasting more than 2 weeks, thoughts of self-harm, inability to perform daily activities due to anxiety or depression, or if steroid-induced mood swings are severe.',
    sources: ['National Cancer Institute — Adjustment to Cancer', 'NCCN Distress Management Guidelines'],
  },
]

export default function Guide() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F2' }}>
      <nav style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700,
          }}>C</div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'var(--text)' }}>ChemoLog</span>
        </Link>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/dashboard" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Dashboard</Link>
          <Link to="/" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Home</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>
          Side Effects Guide
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.65, maxWidth: 600, marginBottom: 12 }}>
          Evidence-based information about common chemotherapy side effects. Know what to expect, how to manage symptoms, and when to contact your care team.
        </p>
        <div style={{
          background: '#FEF8E8', border: '1px solid #F4A26133', borderRadius: 12,
          padding: '14px 18px', marginBottom: 40, fontSize: 14, color: '#92400E', lineHeight: 1.5,
        }}>
          ⚠️ <strong>This is educational information, not medical advice.</strong> Always follow your oncologist's specific guidance for your treatment plan. If you're experiencing severe symptoms, call your care team immediately.
        </div>

        {GUIDES.map((g, i) => {
          const open = expanded === g.key
          return (
            <div key={g.key} style={{
              background: 'var(--card)', borderRadius: 18, marginBottom: 16,
              border: open ? '1.5px solid #2A9D8F44' : '1px solid var(--border)',
              overflow: 'hidden', transition: 'border-color 0.3s',
            }}>
              <button
                onClick={() => setExpanded(open ? null : g.key)}
                style={{
                  width: '100%', padding: '24px 28px', border: 'none', background: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans'",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 28 }}>{g.emoji}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>{g.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.prevalence}</div>
                  </div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: open ? 'var(--accent-light)' : '#F0F0EE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: open ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'all 0.3s', transform: open ? 'rotate(45deg)' : 'none',
                  fontWeight: 700, flexShrink: 0,
                }}>+</div>
              </button>

              {open && (
                <div style={{ padding: '0 28px 28px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'grid', gap: 24 }}>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 8 }}>When it happens</h4>
                      <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.65 }}>{g.timing}</p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 8 }}>Why it happens</h4>
                      <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.65 }}>{g.cause}</p>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 8 }}>What can help</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {g.management.map((m, j) => (
                          <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>•</span>
                            <span style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12,
                      padding: '16px 20px',
                    }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#DC2626', marginBottom: 8 }}>🚨 When to call your care team</h4>
                      <p style={{ fontSize: 14, color: '#7F1D1D', lineHeight: 1.6 }}>{g.whenToCall}</p>
                    </div>

                    <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>
                      Sources: {g.sources.join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div style={{
          background: 'var(--card)', borderRadius: 16, padding: '32px',
          border: '1px solid var(--border)', marginTop: 32, textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, marginBottom: 10 }}>Need to talk to someone?</h3>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 20px' }}>
            The American Cancer Society provides a 24/7 helpline for patients and caregivers.
          </p>
          <a href="tel:1-800-227-2345" style={{
            fontSize: 16, fontWeight: 600, color: 'var(--accent)',
          }}>📞 1-800-227-2345 (ACS Helpline)</a>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  )
}
