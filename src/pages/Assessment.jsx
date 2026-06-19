import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const STEPS = ['About you', 'Your field', 'Priorities', 'Culture & lifestyle', 'Budget & timeline']

const NATIONALITIES = ['Afghan','Albanian','Algerian','American','Argentinian','Australian','Bangladeshi','Brazilian','British','Canadian','Chinese','Colombian','Egyptian','Ethiopian','French','German','Ghanaian','Indian','Indonesian','Iranian','Iraqi','Italian','Japanese','Kenyan','Lebanese','Malaysian','Moroccan','Mexican','Nigerian','Pakistani','Peruvian','Philippino','Polish','Romanian','Russian','Saudi Arabian','Senegalese','Singaporean','Somali','South African','South Korean','Spanish','Sri Lankan','Sudanese','Swedish','Syrian','Taiwanese','Tanzanian','Thai','Turkish','Ugandan','Ukrainian','Venezuelan','Vietnamese','Other']
const FIELDS = ['Engineering (Mechanical / Civil)', 'Engineering (Electrical / Electronics)', 'Computer Science / AI / Data', 'Business / MBA', 'Finance / Economics', 'Medicine / Biomedical', 'Law', 'Architecture / Urban Design', 'Arts / Design / Fashion', 'Social Sciences / Psychology', 'Environmental / Sustainability', 'Linguistics / Literature', 'Natural Sciences', 'Other']
const DEGREE_LEVELS = ['Bachelor\'s', 'Master\'s (MSc/MA)', 'MBA', 'PhD / Research', 'Exchange / Semester abroad']

const DIMENSION_INFO = [
  { key: 'career',     label: 'Career & visa pathway',    icon: '💼', hint: 'Job market strength, internships, post-grad visa options' },
  { key: 'cost',       label: 'Affordability',            icon: '💰', hint: 'Rent, groceries, transport — lower budget = higher priority' },
  { key: 'safety',     label: 'Safety & inclusion',       icon: '🛡️', hint: 'Personal safety, racism tolerance, LGBTQ+ climate' },
  { key: 'social',     label: 'Social life & culture',    icon: '🎭', hint: 'Events, communities, nightlife, cultural richness' },
  { key: 'diversity',  label: 'Diversity & representation',icon: '🌍', hint: 'International student community, representation of your background' },
  { key: 'healthcare', label: 'Healthcare access',        icon: '🏥', hint: 'Affordability and quality of medical / mental health support' },
]

const RELIGION_OPTIONS = [
  { value: 'none',      label: 'No preference', emoji: '—' },
  { value: 'muslim',    label: 'Muslim',         emoji: '☪️' },
  { value: 'christian', label: 'Christian',      emoji: '✝️' },
  { value: 'hindu',     label: 'Hindu',          emoji: '🕉️' },
  { value: 'buddhist',  label: 'Buddhist',       emoji: '☸️' },
  { value: 'jewish',    label: 'Jewish',         emoji: '✡️' },
  { value: 'other',     label: 'Other',          emoji: '🙏' },
]

const SOCIAL_STYLES = [
  { value: 'quiet',            label: 'Quiet & focused', desc: 'Home, café, focused study. Social is secondary.' },
  { value: 'community_active', label: 'Community builder', desc: 'Clubs, events, student organisations. Making real friends.' },
  { value: 'nightlife',        label: 'Nightlife & socialising', desc: 'Bars, parties, exploring the city after dark.' },
  { value: 'outdoors',         label: 'Outdoors & active', desc: 'Nature, cycling, sport, travel. City is just the base.' },
]

const ALCOHOL_OPTIONS = [
  { value: 'fine',        label: 'Totally fine with it' },
  { value: 'prefer_none', label: 'I prefer not to, but no strong objection' },
  { value: 'must_avoid',  label: 'I need an alcohol-minimal environment' },
]

const BUDGET_OPTIONS = [
  { value: 'under_1000',  label: 'Under $1,000/mo',      desc: 'Very budget-conscious — Delft / Paris CROUS recommended' },
  { value: '1000_1500',   label: '$1,000–$1,500/mo',     desc: 'Comfortable in NL or Paris; tight in Boston' },
  { value: '1500_2500',   label: '$1,500–$2,500/mo',     desc: 'Comfortable across all three cities' },
  { value: 'above_2500',  label: 'Above $2,500/mo',      desc: 'Full comfort in Boston; living well everywhere' },
]

const TIMELINE_OPTIONS = [
  { value: 'sep_2025', label: 'September 2025' },
  { value: 'jan_2026', label: 'January 2026'  },
  { value: 'sep_2026', label: 'September 2026' },
  { value: 'jan_2027', label: 'January 2027'  },
  { value: 'other',    label: 'Other / TBD'   },
]

const DEFAULT_WEIGHTS = { career: 7, cost: 6, safety: 7, social: 5, diversity: 5, healthcare: 5 }

export default function Assessment() {
  const navigate = useNavigate()
  const { setProfile: setCtxProfile } = useApp()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({
    name: '', nationality: '', age: '',
    fieldOfStudy: '', degreeLevel: '',
    weights: { ...DEFAULT_WEIGHTS },
    religion: 'none', alcoholComfort: 'fine', socialStyle: 'community_active', dietaryNeeds: [],
    budget: '1000_1500', startDate: 'sep_2026',
  })

  const set = (key, val) => setProfile(p => ({ ...p, [key]: val }))
  const setWeight = (dim, val) => setProfile(p => ({ ...p, weights: { ...p.weights, [dim]: val } }))

  const canAdvance = () => {
    if (step === 0) return profile.name.trim() && profile.nationality && profile.age
    if (step === 1) return profile.fieldOfStudy && profile.degreeLevel
    return true
  }

  const handleSubmit = () => {
    setCtxProfile(profile)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-lg">
              <span className="text-gradient">Horizon</span><span className="text-slate-300">Fit</span>
            </span>
            <span className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}</span>
          </div>
          {/* Progress */}
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full progress-bar" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="flex mt-2 gap-0">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex-1 text-center text-xs transition-colors ${i <= step ? 'text-violet-400' : 'text-slate-600'}`}>
                {i < step ? <Check className="w-3 h-3 mx-auto" /> : <span className="hidden md:block">{s}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl animate-fade-in">

          {/* STEP 0: About you */}
          {step === 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-slate-400 mb-8">This helps us calibrate cultural fit beyond raw statistics.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Your first name</label>
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="e.g. Rohan"
                    value={profile.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nationality</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                    value={profile.nationality}
                    onChange={e => set('nationality', e.target.value)}
                  >
                    <option value="">Select nationality…</option>
                    {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
                  <input
                    type="number" min="16" max="45"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                    placeholder="e.g. 22"
                    value={profile.age}
                    onChange={e => set('age', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Field of study */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">What are you studying?</h2>
              <p className="text-slate-400 mb-8">Your field significantly affects which city suits you — career pipelines are sector-specific.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Field of study</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-violet-500 transition-colors"
                    value={profile.fieldOfStudy}
                    onChange={e => set('fieldOfStudy', e.target.value)}
                  >
                    <option value="">Select your field…</option>
                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Degree level</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEGREE_LEVELS.map(d => (
                      <button
                        key={d}
                        onClick={() => set('degreeLevel', d)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${profile.degreeLevel === d ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Priority weights */}
          {step === 2 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">What matters most to you?</h2>
              <p className="text-slate-400 mb-8">
                Drag each slider to reflect how much this dimension matters to your decision.{' '}
                <span className="text-violet-400">These weights directly power the matching algorithm.</span>
              </p>
              <div className="space-y-6">
                {DIMENSION_INFO.map(({ key, label, icon, hint }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span className="font-medium text-slate-200">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{['Not important','Somewhat','Important','Very important','Critical'][Math.floor((profile.weights[key] - 1) / 2.25)]}</span>
                        <span className="text-sm font-bold text-violet-400 w-4 text-right">{profile.weights[key]}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 ml-7">{hint}</p>
                    <input
                      type="range" min="1" max="10" step="1"
                      value={profile.weights[key]}
                      onChange={e => setWeight(key, Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>1 — not important</span>
                      <span>10 — critical</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Culture & lifestyle */}
          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Culture & lifestyle preferences</h2>
              <p className="text-slate-400 mb-8">These nuances matter far more than statistics typically capture.</p>

              <div className="space-y-8">
                {/* Religion */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Religion / faith affiliation</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {RELIGION_OPTIONS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => set('religion', r.value)}
                        className={`px-3 py-2 rounded-xl border text-sm transition-all ${profile.religion === r.value ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        {r.emoji} {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alcohol */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Your relationship with alcohol culture</label>
                  <p className="text-xs text-slate-500 mb-3">This affects social environments and community fit significantly.</p>
                  <div className="space-y-2">
                    {ALCOHOL_OPTIONS.map(a => (
                      <button
                        key={a.value}
                        onClick={() => set('alcoholComfort', a.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${profile.alcoholComfort === a.value ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social style */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Your social style abroad</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOCIAL_STYLES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => set('socialStyle', s.value)}
                        className={`text-left px-4 py-3 rounded-xl border transition-all ${profile.socialStyle === s.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-600'}`}
                      >
                        <div className={`font-medium text-sm mb-0.5 ${profile.socialStyle === s.value ? 'text-violet-300' : 'text-slate-300'}`}>{s.label}</div>
                        <div className="text-xs text-slate-500">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Budget & timeline */}
          {step === 4 && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Budget & arrival timeline</h2>
              <p className="text-slate-400 mb-8">Cost forecasts are calibrated to when you actually arrive, not today's prices.</p>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Monthly budget for living costs</label>
                  <div className="space-y-2">
                    {BUDGET_OPTIONS.map(b => (
                      <button
                        key={b.value}
                        onClick={() => set('budget', b.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${profile.budget === b.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-600'}`}
                      >
                        <div className={`font-medium text-sm ${profile.budget === b.value ? 'text-violet-300' : 'text-slate-300'}`}>{b.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Planned start date</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TIMELINE_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => set('startDate', t.value)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${profile.startDate === t.value ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile review */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                  <h3 className="font-semibold text-sm text-slate-300 mb-4">Your profile summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['Name', profile.name],
                      ['Nationality', profile.nationality],
                      ['Field', profile.fieldOfStudy],
                      ['Degree', profile.degreeLevel],
                      ['Religion', profile.religion],
                      ['Social style', profile.socialStyle?.replace('_', ' ')],
                      ['Budget', BUDGET_OPTIONS.find(b => b.value === profile.budget)?.label],
                      ['Start date', TIMELINE_OPTIONS.find(t => t.value === profile.startDate)?.label],
                    ].map(([k, v]) => v && (
                      <div key={k}>
                        <span className="text-slate-500">{k}: </span>
                        <span className="text-slate-200 capitalize">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <div className="text-xs text-slate-500 mb-2">Priority weights</div>
                    <div className="grid grid-cols-3 gap-2">
                      {DIMENSION_INFO.map(({ key, label, icon }) => (
                        <div key={key} className="text-xs">
                          <span className="text-slate-500">{icon} {label.split(' ')[0]}: </span>
                          <span className="text-violet-400 font-medium">{profile.weights[key]}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────── */}
          <div className="flex gap-4 mt-10">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-white transition-all"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold text-white transition-all hover:scale-105"
              >
                Find my city
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
