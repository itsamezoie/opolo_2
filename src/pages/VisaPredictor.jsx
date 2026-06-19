import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { VISA_PROGRAMS } from '../data/visaPredictorData.js'

const CITY_FLAGS  = { boston: '🇺🇸', paris: '🇫🇷', netherlands: '🇳🇱' }
const CITY_LABELS = { boston: 'Boston, USA', paris: 'Paris, France', netherlands: 'Netherlands' }

// SVG Radial Gauge
function RadialGauge({ score, label, color }) {
  const SIZE     = 180
  const STROKE   = 16
  const R        = (SIZE / 2) - STROKE
  const CIRCUM   = 2 * Math.PI * R
  // gauge is a 240° arc starting at 150° (bottom-left), ending at 390° (bottom-right)
  const ARC_DEG  = 240
  const dashArray = (ARC_DEG / 360) * CIRCUM
  const dashOffset = dashArray - (score / 100) * dashArray

  // Colours per score band
  const gaugeColor =
    score >= 85 ? '#34d399'   // emerald
    : score >= 65 ? '#2dd4bf' // teal
    : score >= 45 ? '#f59e0b' // amber
    : '#f87171'               // red

  // Rotation so the arc starts at 150° (bottom-left sweep upward)
  const rotation = 150

  return (
    <div className="flex flex-col items-center">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" stroke="rgb(30,41,59)" strokeWidth={STROKE}
          strokeDasharray={`${dashArray} ${CIRCUM}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
        />
        {/* Fill */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" stroke={gaugeColor} strokeWidth={STROKE}
          strokeDasharray={`${dashArray} ${CIRCUM}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Score text */}
        <text
          x={SIZE / 2} y={SIZE / 2 + 6}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="28" fontWeight="700" fill={gaugeColor}
        >
          {score}
        </text>
        <text
          x={SIZE / 2} y={SIZE / 2 + 26}
          textAnchor="middle" fontSize="10" fill="rgb(148,163,184)"
        >
          / 100
        </text>
      </svg>
      <p className={`text-sm font-bold mt-1 ${color}`}>{label}</p>
    </div>
  )
}

// Individual factor card
function FactorCard({ factor, value, onChange }) {
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
            {selectedTier && (
              <span className="text-xs text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
                {selectedTier.score}/{factor.weight}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{factor.description}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3 animate-fade-in">
          {/* Options */}
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
                  <p className="text-xs text-slate-500">{tier.score} / {factor.weight} points</p>
                </div>
              </label>
            ))}
          </div>

          {/* Tip */}
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

export default function VisaPredictor() {
  const { selectedCityId, setSelectedCityId, visaAnswers, setVisaAnswers } = useApp()

  const visaData = VISA_PROGRAMS[selectedCityId]

  // answers: { [cityId]: { [factorId]: { value, score } } }
  const cityAnswers = visaAnswers[selectedCityId] || {}

  const handleAnswer = (factorId, value, score) => {
    setVisaAnswers(prev => ({
      ...prev,
      [selectedCityId]: {
        ...(prev[selectedCityId] || {}),
        [factorId]: { value, score },
      }
    }))
  }

  const totalScore = useMemo(() => {
    return visaData.factors.reduce((sum, f) => {
      const ans = cityAnswers[f.id]
      return sum + (ans ? ans.score : 0)
    }, 0)
  }, [cityAnswers, visaData])

  const answeredCount = visaData.factors.filter(f => cityAnswers[f.id]).length
  const allAnswered = answeredCount === visaData.factors.length

  const scoreBand = visaData.scoreLabels.find(b => totalScore >= b.min)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Visa Predictor</h1>
        <p className="text-slate-400 text-sm mt-1">Estimate your visa approval likelihood based on your current situation</p>
      </div>

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
            <p className="text-xs text-slate-400 mb-2">{visaData.intro}</p>
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
        {/* ── Questions ───────────────────────── */}
        <div className="md:col-span-3 space-y-3">
          <h3 className="text-sm font-bold text-slate-300">
            Assessment ({answeredCount}/{visaData.factors.length} answered)
          </h3>
          {visaData.factors.map(factor => (
            <FactorCard
              key={factor.id}
              factor={factor}
              value={cityAnswers[factor.id]?.value || ''}
              onChange={handleAnswer}
            />
          ))}
        </div>

        {/* ── Score gauge (sticky) ─────────────── */}
        <div className="md:col-span-2">
          <div className="sticky top-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-300">Your Score</h3>

            <RadialGauge
              score={allAnswered ? totalScore : Math.round((answeredCount / visaData.factors.length) * totalScore) || 0}
              label={scoreBand?.label || '—'}
              color={scoreBand?.color || 'text-slate-400'}
            />

            {scoreBand && (
              <p className="text-xs text-slate-400 leading-relaxed text-left">
                {scoreBand.desc}
              </p>
            )}

            {!allAnswered && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80">
                  Answer all {visaData.factors.length} questions for your full score.
                </p>
              </div>
            )}

            {allAnswered && totalScore >= 85 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200/80">
                  Strong profile! Review the tips inside each factor to maximise your chances.
                </p>
              </div>
            )}

            {/* Factor breakdown */}
            <div className="space-y-2 text-left border-t border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-400">Factor breakdown</p>
              {visaData.factors.map(f => {
                const ans = cityAnswers[f.id]
                const score = ans?.score || 0
                const pct = Math.round((score / f.weight) * 100)
                return (
                  <div key={f.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 truncate">{f.label}</span>
                      <span className={ans ? 'text-slate-300' : 'text-slate-600'}>{ans ? `${score}/${f.weight}` : `—/${f.weight}`}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 80 ? '#34d399' : pct >= 50 ? '#f59e0b' : '#f87171'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-[10px] text-slate-600 text-left leading-relaxed pt-1">
              Disclaimer: This is an indicative score only. Visa decisions are at the sole discretion of each country's immigration authority. Always verify requirements with official sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
