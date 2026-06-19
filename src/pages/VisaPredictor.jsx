import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle, CheckCircle2, Info, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { VISA_PROGRAMS } from '../data/visaPredictorData.js'

const CITY_FLAGS  = { boston: '🇺🇸', paris: '🇫🇷', netherlands: '🇳🇱' }
const CITY_LABELS = { boston: 'Boston, USA', paris: 'Paris, France', netherlands: 'Netherlands' }

// ── Qualitative label from score (0–100) — NO numeric display ────────────────
function getQualitativeLabel(score) {
  if (score >= 88) return { label: 'Exceptional Fit',       color: '#34d399', textColor: 'text-emerald-400' }
  if (score >= 78) return { label: 'Well Prepared',         color: '#2dd4bf', textColor: 'text-teal-400'    }
  if (score >= 68) return { label: 'Strong Candidate',      color: '#60a5fa', textColor: 'text-blue-400'    }
  if (score >= 58) return { label: 'Favorable Outlook',     color: '#a78bfa', textColor: 'text-violet-400'  }
  if (score >= 45) return { label: 'Moderate Potential',    color: '#fbbf24', textColor: 'text-amber-400'   }
  if (score >= 30) return { label: 'Needs Strengthening',   color: '#fb923c', textColor: 'text-orange-400'  }
  return                  { label: 'Significant Challenges', color: '#f87171', textColor: 'text-red-400'    }
}

// ── SVG Radial Gauge — shows qualitative label, no numbers ───────────────────
function RadialGauge({ score, hasAnswers }) {
  const SIZE    = 190
  const STROKE  = 18
  const R       = (SIZE / 2) - STROKE
  const CIRCUM  = 2 * Math.PI * R
  const ARC_DEG = 240
  const dashArray  = (ARC_DEG / 360) * CIRCUM
  const dashOffset = hasAnswers ? dashArray - (score / 100) * dashArray : dashArray
  const rotation   = 150
  const { label, color } = getQualitativeLabel(score)

  // Split label into two lines if needed
  const words   = label.split(' ')
  const line1   = words.slice(0, Math.ceil(words.length / 2)).join(' ')
  const line2   = words.slice(Math.ceil(words.length / 2)).join(' ')
  const singleLine = words.length <= 2

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" stroke="rgb(30,41,59)" strokeWidth={STROKE}
          strokeDasharray={`${dashArray} ${CIRCUM}`}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
        />
        {/* Fill */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" stroke={hasAnswers ? color : 'rgb(51,65,85)'} strokeWidth={STROKE}
          strokeDasharray={`${dashArray} ${CIRCUM}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
        />
        {/* Qualitative label text — NO numbers */}
        {hasAnswers ? (
          singleLine ? (
            <text x={SIZE / 2} y={SIZE / 2 + 5}
              textAnchor="middle" fontSize="13" fontWeight="700"
              fill={color} style={{ fontFamily: 'Inter, sans-serif' }}>
              {label}
            </text>
          ) : (
            <>
              <text x={SIZE / 2} y={SIZE / 2 - 5}
                textAnchor="middle" fontSize="12" fontWeight="700"
                fill={color} style={{ fontFamily: 'Inter, sans-serif' }}>
                {line1}
              </text>
              <text x={SIZE / 2} y={SIZE / 2 + 12}
                textAnchor="middle" fontSize="12" fontWeight="700"
                fill={color} style={{ fontFamily: 'Inter, sans-serif' }}>
                {line2}
              </text>
            </>
          )
        ) : (
          <text x={SIZE / 2} y={SIZE / 2 + 5}
            textAnchor="middle" fontSize="11" fill="rgb(100,116,139)"
            style={{ fontFamily: 'Inter, sans-serif' }}>
            answer to score
          </text>
        )}
      </svg>
    </div>
  )
}

// ── Individual factor assessment card ────────────────────────────────────────
function FactorCard({ factor, value, onChange, prefilled }) {
  const [open, setOpen] = useState(false)
  const selectedTier = factor.tiers.find(t => t.value === value)

  return (
    <div className={`rounded-xl border transition-all ${value ? 'border-violet-500/30 bg-violet-500/5' : 'border-slate-800 bg-slate-900'}`}>
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-200">{factor.label}</span>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {factor.weight} pts
            </span>
            {prefilled && !open && (
              <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> Auto-filled from profile
              </span>
            )}
            {selectedTier && (
              <span className="text-xs text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30 ml-auto">
                ✓ Answered
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{factor.description}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3 animate-fade-in">
          <div className="space-y-2">
            {factor.tiers.map(tier => (
              <label
                key={tier.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  value === tier.value
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={factor.id}
                  value={tier.value}
                  checked={value === tier.value}
                  onChange={() => onChange(factor.id, tier.value, tier.score)}
                  className="mt-0.5 accent-violet-500"
                />
                <div>
                  <p className="text-sm text-slate-200">{tier.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tier.score} / {factor.weight} points</p>
                </div>
              </label>
            ))}
          </div>

          {factor.tip && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200/80">{factor.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Budget → financial tier mapping ─────────────────────────────────────────
function getBudgetTier(budget, visaId) {
  const map = {
    boston: { under_1000: 'limited', '1000_1500': 'partial', '1500_2500': 'full_coverage', above_2500: 'full_coverage' },
    paris:  { under_1000: 'weak',    '1000_1500': 'moderate', '1500_2500': 'strong',       above_2500: 'strong'       },
    netherlands: { under_1000: 'insufficient', '1000_1500': 'partial', '1500_2500': 'full', above_2500: 'full' },
  }
  return map[visaId]?.[budget] || null
}

// ── Language test → visa language tier mapping ───────────────────────────────
function getLanguageTier(languageTest, languageScore, visaId) {
  if (!languageTest || languageTest === 'none') return null
  const score = languageScore

  if (visaId === 'boston' || visaId === 'netherlands') {
    // English tiers: high = IELTS ≥7.5 / TOEFL ≥100; medium = 6.5-7.0 / 80-99; low = below
    if (languageTest === 'ielts') {
      const n = parseFloat(score)
      if (isNaN(n)) return null
      if (n >= 7.5) return 'high'
      if (n >= 6.5) return 'medium'
      return 'low'
    }
    if (languageTest === 'toefl') {
      const n = parseInt(score, 10)
      if (isNaN(n)) return null
      if (n >= 100) return 'high'
      if (n >= 80) return 'medium'
      return 'low'
    }
    if (languageTest === 'duolingo') {
      const n = parseInt(score, 10)
      if (isNaN(n)) return null
      if (n >= 130) return 'high'
      if (n >= 100) return 'medium'
      return 'low'
    }
  }
  if (visaId === 'paris') {
    if (languageTest === 'delf' || languageTest === 'tcf') {
      const lvl = score.toUpperCase()
      if (lvl === 'C1' || lvl === 'C2') return 'high'
      if (lvl === 'B2') return 'high' // for English programme: use IELTS mapping below
      if (lvl === 'B1') return 'medium'
      return 'low'
    }
    if (languageTest === 'ielts') {
      const n = parseFloat(score)
      if (isNaN(n)) return null
      if (n >= 7.0) return 'high'
      if (n >= 6.5) return 'medium'
      return 'low'
    }
    if (languageTest === 'toefl') {
      const n = parseInt(score, 10)
      if (isNaN(n)) return null
      if (n >= 95) return 'high'
      if (n >= 80) return 'medium'
      return 'low'
    }
  }
  return null
}

export default function VisaPredictor() {
  const { selectedCityId, setSelectedCityId, visaAnswers, setVisaAnswers, profile } = useApp()
  const visaData = VISA_PROGRAMS[selectedCityId]
  const cityAnswers = visaAnswers[selectedCityId] || {}
  const [prefilled, setPrefilled] = useState({})

  // Auto-populate financial and language factors from profile
  useEffect(() => {
    if (!profile?.budget && !profile?.languageTest) return

    const updates = {}
    const prefilledFactors = {}

    // Financial means factor
    const fundsFactor = visaData.factors.find(f =>
      f.id.includes('fund') || f.id.includes('finance') || f.id.includes('means')
    )
    if (fundsFactor && profile.budget) {
      const tier = getBudgetTier(profile.budget, selectedCityId)
      const match = fundsFactor.tiers.find(t => t.value === tier)
      if (match && !cityAnswers[fundsFactor.id]) {
        updates[fundsFactor.id] = { value: match.value, score: match.score }
        prefilledFactors[fundsFactor.id] = true
      }
    }

    // Language factor
    const langFactor = visaData.factors.find(f =>
      f.id.includes('lang') || f.id.includes('english') || f.id.includes('french')
    )
    if (langFactor && profile.languageTest) {
      const langTier = getLanguageTier(profile.languageTest, profile.languageScore, selectedCityId)
      const match = langFactor?.tiers?.find(t => t.value === langTier)
      if (match && !cityAnswers[langFactor.id]) {
        updates[langFactor.id] = { value: match.value, score: match.score }
        prefilledFactors[langFactor.id] = true
      }
    }

    if (Object.keys(updates).length > 0) {
      setVisaAnswers(prev => ({
        ...prev,
        [selectedCityId]: { ...(prev[selectedCityId] || {}), ...updates },
      }))
      setPrefilled(prefilledFactors)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId])

  const handleAnswer = (factorId, value, score) => {
    setVisaAnswers(prev => ({
      ...prev,
      [selectedCityId]: { ...(prev[selectedCityId] || {}), [factorId]: { value, score } },
    }))
    // If manually answered, remove prefill flag
    setPrefilled(p => { const n = { ...p }; delete n[factorId]; return n })
  }

  const totalScore = useMemo(() => {
    return visaData.factors.reduce((sum, f) => {
      const ans = visaAnswers[selectedCityId]?.[f.id]
      return sum + (ans ? ans.score : 0)
    }, 0)
  }, [visaAnswers, selectedCityId, visaData])

  const answeredCount = visaData.factors.filter(f => (visaAnswers[selectedCityId] || {})[f.id]).length
  const allAnswered = answeredCount === visaData.factors.length
  const hasAny = answeredCount > 0

  const { label: qualLabel, textColor } = getQualitativeLabel(totalScore)
  const scoreBand = visaData.scoreLabels.find(b => totalScore >= b.min)

  // Criminal background warning
  const hasCriminalFlag = profile?.criminalBackground === 'yes' || profile?.criminalBackground === 'minor'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Visa Predictor</h1>
        <p className="text-slate-400 text-sm mt-1">Estimate your visa approval likelihood based on your profile</p>
      </div>

      {/* Profile integration notice */}
      {(profile?.budget || profile?.languageTest) && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
          <Zap className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-teal-200/80">
            Some fields have been <span className="font-semibold">auto-populated from your assessment</span> — budget and language scores flow directly into relevant visa factors. You can still override any answer.
          </p>
        </div>
      )}

      {/* Criminal background alert */}
      {hasCriminalFlag && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/80">
            Your profile indicates a criminal background history. A police clearance certificate and legal declaration will be required during the application process. This is factored into your eligibility score.
          </p>
        </div>
      )}

      {/* Destination selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CITY_LABELS).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSelectedCityId(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              selectedCityId === id
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <span>{CITY_FLAGS[id]}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Visa info card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{CITY_FLAGS[selectedCityId]}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-100 mb-1">{visaData.label}</h2>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">{visaData.intro}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span>⏱ {visaData.processingTime}</span>
              <span>🔄 {visaData.renewalRequired}</span>
            </div>
          </div>
          <a
            href={visaData.officialLink}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors flex-shrink-0"
          >
            Official site <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* ── Questions ──────────────────────────────── */}
        <div className="md:col-span-3 space-y-3">
          <h3 className="text-sm font-bold text-slate-300">
            Assessment ({answeredCount}/{visaData.factors.length} answered)
          </h3>
          {visaData.factors.map(factor => (
            <FactorCard
              key={factor.id}
              factor={factor}
              value={(visaAnswers[selectedCityId] || {})[factor.id]?.value || ''}
              onChange={handleAnswer}
              prefilled={!!prefilled[factor.id]}
            />
          ))}
        </div>

        {/* ── Score panel (sticky) ───────────────────── */}
        <div className="md:col-span-2">
          <div className="sticky top-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Visa Readiness</h3>

            <RadialGauge score={totalScore} hasAnswers={hasAny} />

            {hasAny && (
              <p className={`text-base font-bold ${textColor}`}>{qualLabel}</p>
            )}

            {scoreBand && hasAny && (
              <p className="text-xs text-slate-400 leading-relaxed text-left">
                {scoreBand.desc}
              </p>
            )}

            {!allAnswered && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80">
                  {answeredCount === 0
                    ? 'Answer the questions to see your visa readiness assessment.'
                    : `${visaData.factors.length - answeredCount} question${visaData.factors.length - answeredCount > 1 ? 's' : ''} remaining for your full assessment.`}
                </p>
              </div>
            )}

            {allAnswered && totalScore >= 78 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200/80">
                  Strong profile. Review the tips inside each factor to maximise your approval chances.
                </p>
              </div>
            )}

            {/* Factor breakdown — qualitative only */}
            <div className="space-y-2.5 text-left border-t border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-400">Factor breakdown</p>
              {visaData.factors.map(f => {
                const ans = (visaAnswers[selectedCityId] || {})[f.id]
                const score = ans?.score || 0
                const pct = Math.round((score / f.weight) * 100)
                const isStrong = pct >= 80
                const isWeak = ans && pct < 40
                return (
                  <div key={f.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 truncate flex-1">{f.label}</span>
                      <span className={`ml-2 flex-shrink-0 text-[10px] font-medium ${!ans ? 'text-slate-600' : isStrong ? 'text-emerald-400' : isWeak ? 'text-red-400' : 'text-amber-400'}`}>
                        {!ans ? 'Not answered' : isStrong ? 'Strong' : isWeak ? 'Needs work' : 'Moderate'}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 80 ? '#34d399' : pct >= 50 ? '#a78bfa' : pct > 0 ? '#f87171' : 'transparent',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-[10px] text-slate-600 text-left leading-relaxed pt-1">
              Indicative assessment only. Visa decisions rest solely with each country's immigration authority. Always verify requirements via official channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
