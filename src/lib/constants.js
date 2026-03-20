// Single source of truth — imported by Dashboard, LogEntry, Report, Guide
export const SYMPTOMS = [
  { key: 'nausea', label: 'Nausea', emoji: '🤢', desc: 'Feeling sick to your stomach', warn: 'Contact your care team if you can\'t keep fluids down for 12+ hours.' },
  { key: 'fatigue', label: 'Fatigue', emoji: '😴', desc: 'Low energy, exhaustion', warn: 'Expected to worsen with each cycle. Rest is not laziness — it\'s recovery.' },
  { key: 'pain', label: 'Pain', emoji: '😣', desc: 'Body aches, headaches, soreness', warn: 'New or sudden severe pain should always be reported to your oncologist.' },
  { key: 'neuropathy', label: 'Neuropathy', emoji: '🫠', desc: 'Tingling, numbness in hands/feet', warn: 'Can persist long after treatment ends. Report worsening early — dose adjustments help.' },
  { key: 'appetite_loss', label: 'Appetite loss', emoji: '🍽️', desc: 'Reduced desire to eat', warn: 'Try small, frequent meals. Nutritional supplements can help maintain weight.' },
  { key: 'mood', label: 'Low mood', emoji: '😔', desc: 'Sadness, anxiety, frustration', warn: 'Mental health is part of cancer care. Ask your team about counseling or support groups.' },
]
 
export const COLORS = ['#2A9D8F', '#E76F51', '#E9C46A', '#264653', '#F4A261', '#6B7280']
 
export const SEVERITY_COLOR = (val) =>
  val >= 7 ? 'var(--coral)' : val >= 4 ? '#D97706' : 'var(--accent)'
 
export const SEVERITY_BG = (val) =>
  val >= 7 ? '#FEF2F2' : val >= 4 ? '#FEF8E8' : 'var(--accent-light)'
