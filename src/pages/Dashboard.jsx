import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, AlertTriangle, Briefcase, Home, Shield, Users, Heart, DollarSign } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { calculateMatchScores, getFirstTolerancePrompt } from '../lib/matchingEngine.js'
import { classifyStudentType } from '../lib/clustering.js'
import { DIMENSION_META } from '../data/cityData.js'
import ToleranceModal from '../components/ToleranceModal.jsx'
import CostForecastChart from '../components/CostForecastChart.jsx'
import DimensionChart from '../components/DimensionChart.jsx'
import WhyThisMatches from '../components/WhyThisMatches.jsx'
import LivedExperience from '../components/LivedExperience.jsx'
import PeerConnect from '../components/PeerConnect.jsx'

const TABS = [
  { id: 'overview',  label: 'Overview',         icon: <Home className="w-3.5 h-3.5" /> },
  { id: 'career',    label: 'Career & Visa',     icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'safety',    label: 'Safety',            icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'cost',      label: 'Costs & Forecast',  icon: <DollarSign className="w-3.5 h-3.5" /> },
  { id: 'social',    label: 'Social & Culture',  icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'lived',     label: 'Lived Experience',  icon: <Heart className="w-3.5 h-3.5" /> },
]

// Default profile for demo / direct URL access
const DEMO_PROFILE = {
  name: 'Student',
  nationality: 'Indian',
  age: '23',
  fieldOfStudy: 'Computer Science / AI / Data',
  degreeLevel: "Master's (MSc/MA)",
  weights: { career: 9, cost: 7, safety: 7, social: 5, diversity: 6, healthcare: 5 },
  religion: 'none',
  alcoholComfort: 'fine',
  socialStyle: 'community_active',
  budget: '1000_1500',
  startDate: 'sep_2026',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    profile: ctxProfile,
    selectedCityId, setSelectedCityId,
    tolerances, setTolerances,
  } = useApp()
  const profile = ctxProfile?.name ? ctxProfile : DEMO_PROFILE

  const [results, setResults] = useState([])
  const [archetype, setArchetype] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [toleranceModal, setToleranceModal] = useState(null)
  // Run matching whenever profile or tolerances change
  useEffect(() => {
    const scored = calculateMatchScores(profile, tolerances)
    setResults(scored)
    // Auto-select top match if using a real profile (not demo)
    if (scored.length > 0 && profile !== DEMO_PROFILE) {
      setSelectedCityId(scored[0].city.id)
    }
    // Trigger tolerance modal if needed
    const firstPrompt = getFirstTolerancePrompt(scored)
    if (firstPrompt && !toleranceModal) {
      setToleranceModal(firstPrompt.prompt)
    }
  }, [profile, tolerances])

  // Classify archetype once
  useEffect(() => {
    setArchetype(classifyStudentType(profile.weights))
  }, [])

  const handleToleranceSubmit = (dimension, value) => {
    setTolerances(t => ({ ...t, [dimension]: value }))
    setToleranceModal(null)
  }

  const selected = results.find(r => r.city.id === selectedCityId)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/assess')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Reassess
          </button>
          <span className="font-bold text-lg ml-auto">
            <span className="text-gradient">Horizon</span><span className="text-slate-300">Fit</span>
          </span>
          {Object.keys(tolerances).length > 0 && (
            <button
              onClick={() => { setTolerances({}); setToleranceModal(null) }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset tolerances
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Hero greeting ─────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            {profile.name !== 'Student' ? `${profile.name}'s` : 'Your'} city matches
          </h1>
          <p className="text-slate-400 text-sm">
            Based on your priorities · {profile.fieldOfStudy} · {profile.nationality}
            {Object.keys(tolerances).length > 0 && (
              <span className="ml-2 text-teal-400">· tolerance adjustments applied</span>
            )}
          </p>
        </div>

        {/* ── Archetype badge ───────────────────────────────── */}
        {archetype && (
          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${archetype.color} text-white text-sm font-medium mb-8`}>
            <span className="text-lg">{archetype.emoji}</span>
            <div>
              <span>{archetype.label}</span>
              <span className="text-white/70 text-xs ml-2">· {archetype.insight}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Left: Ranked results ──────────────────────────── */}
          <div className="xl:col-span-1 space-y-4">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Rankings</h2>
            {results.map((r, i) => (
              <CityCard
                key={r.city.id}
                result={r}
                rank={i + 1}
                selected={r.city.id === selectedCityId}
                onSelect={() => { setSelectedCityId(r.city.id); setActiveTab('overview') }}
              />
            ))}

            {/* Tolerance prompts list */}
            {results.flatMap(r => r.tolerancePrompts).length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">Trade-offs to review</span>
                </div>
                {results.flatMap(r =>
                  r.tolerancePrompts.map(p => (
                    <button
                      key={`${r.city.id}-${p.dimension}`}
                      onClick={() => setToleranceModal(p)}
                      className="w-full text-left text-xs text-amber-400/80 hover:text-amber-300 py-1.5 border-b border-amber-500/10 last:border-0 transition-colors"
                    >
                      {r.city.name}: {p.label} ({p.cityScore}/100) →
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Right: City detail ────────────────────────────── */}
          {selected ? (
            <div className="xl:col-span-2">
              {/* City header */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{selected.city.flag}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selected.city.name}</h2>
                  <p className="text-slate-400 text-sm">{selected.city.subtitle}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${selected.matchColor.bg} ${selected.matchColor.text} ${selected.matchColor.border}`}>
                    {selected.matchLabel}
                  </div>
                  <div className="text-3xl font-bold mt-1">
                    {selected.score}
                    <span className="text-sm text-slate-500 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Why this matches — always visible */}
              <div className="mb-5">
                <WhyThisMatches
                  explanation={selected.explanation}
                  cityName={selected.city.name}
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-slate-900 rounded-xl mb-6 overflow-x-auto scrollbar-thin">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === t.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="animate-fade-in">
                {activeTab === 'overview' && <OverviewTab result={selected} />}
                {activeTab === 'career'   && <CareerTab city={selected.city} />}
                {activeTab === 'safety'   && <SafetyTab city={selected.city} />}
                {activeTab === 'cost'     && <CostTab city={selected.city} />}
                {activeTab === 'social'   && <SocialTab city={selected.city} />}
                {activeTab === 'lived'    && (
                  <div className="space-y-6">
                    <LivedExperience experiences={selected.city.livedExperience} />
                    <PeerConnect ambassador={selected.city.peerAmbassador} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="xl:col-span-2 flex items-center justify-center text-slate-600 text-sm">
              Select a city to see details
            </div>
          )}
        </div>
      </div>

      {/* ── Tolerance Modal ───────────────────────────────── */}
      <ToleranceModal
        prompt={toleranceModal}
        onSubmit={handleToleranceSubmit}
        onDismiss={() => setToleranceModal(null)}
      />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CityCard({ result, rank, selected, onSelect }) {
  const { city, score, strengths, weaknesses, matchLabel, matchColor } = result
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-5 transition-all card-hover ${
        selected
          ? 'border-violet-500/60 bg-violet-500/5 shadow-lg shadow-violet-500/10'
          : 'border-slate-800 bg-slate-900/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{city.flag}</span>
          <div>
            <div className="font-semibold text-slate-100 flex items-center gap-2">
              {city.name}
              {rank === 1 && <span className="text-xs text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">Top pick</span>}
            </div>
            <div className="text-xs text-slate-500">{city.subtitle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${selected ? 'text-violet-400' : 'text-slate-200'}`}>
            {score}
          </div>
          <div className={`text-xs font-medium ${matchColor.text}`}>{matchLabel}</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full progress-bar" style={{ width: `${score}%` }} />
      </div>

      {/* Strengths / weaknesses */}
      <div className="flex flex-wrap gap-1.5">
        {strengths.slice(0, 2).map(s => (
          <span key={s.dim} className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full">
            ✓ {s.label}
          </span>
        ))}
        {weaknesses.slice(0, 1).map(w => (
          <span key={w.dim} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
            △ {w.label}
          </span>
        ))}
      </div>
    </button>
  )
}

function OverviewTab({ result }) {
  const { city } = result
  return (
    <div className="space-y-6">
      <DimensionChart city={city} />

      {/* Quick facts grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '💰', label: 'Shared room', value: city.cost.avgRentShared },
          { icon: '🚇', label: 'Transport', value: city.cost.publicTransportMonthly },
          { icon: '🍽️', label: 'Meal out', value: city.cost.mealOutAvg },
          { icon: '👥', label: 'Intl students', value: `${city.demographics.internationalStudentPct}%` },
        ].map(f => (
          <div key={f.label} className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-xl mb-1">{f.icon}</div>
            <div className="text-xs text-slate-500 mb-0.5">{f.label}</div>
            <div className="font-semibold text-sm text-slate-200">{f.value}</div>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">What this city is really about</div>
        <p className="text-slate-200 font-medium">{city.tagline}</p>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          {city.demographics.localPersonality}
        </p>
      </div>

      {/* Show don't tell */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="text-xs text-slate-500">What "large school" actually means here</div>
        </div>
        <div className="p-4">
          <div className="text-xl font-bold text-gradient mb-1">{city.demographics.whatLargeSchoolMeans.stat}</div>
          <p className="text-sm text-slate-400 leading-relaxed">{city.demographics.whatLargeSchoolMeans.reality}</p>
        </div>
      </div>
    </div>
  )
}

function CareerTab({ city }) {
  const c = city.career
  return (
    <div className="space-y-5">
      {/* Top companies */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h4 className="font-semibold text-slate-200 mb-3">Top employers & sectors</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {c.topCompanies.map(co => (
            <span key={co} className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2.5 py-1 rounded-full">{co}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {c.topSectors.map(s => (
            <span key={s} className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      {/* Visa & salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Post-grad visa</div>
          <div className="font-semibold text-sm text-slate-200 mb-1">{c.postGradVisa}</div>
          <div className={`text-xs font-medium ${c.visaRisk.startsWith('LOW') ? 'text-teal-400' : c.visaRisk.startsWith('MEDIUM') ? 'text-amber-400' : 'text-red-400'}`}>
            Visa risk: {c.visaRisk}
          </div>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Starting salary range</div>
          <div className="font-bold text-lg text-gradient">{c.avgStartSalary}</div>
        </div>
      </div>

      {/* Part-time rules */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">Part-time work rules (as student)</div>
        <p className="text-sm text-slate-300">{c.partTimeRules}</p>
      </div>

      {/* Hidden perk */}
      {c.hiddenPerk && (
        <div className="rounded-xl bg-teal-500/5 border border-teal-500/20 p-4">
          <div className="text-xs text-teal-400 font-medium mb-1">💡 Hidden advantage</div>
          <p className="text-sm text-slate-300 leading-relaxed">{c.hiddenPerk}</p>
        </div>
      )}

      {/* Internship strength */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">Internship / placement culture</div>
        <p className="text-sm text-slate-300 leading-relaxed">{c.internshipStrength}</p>
      </div>
    </div>
  )
}

function SafetyTab({ city }) {
  const s = city.safety
  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="flex gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex-1">
          <div className="text-xs text-slate-500 mb-1">Overall safety score</div>
          <div className={`text-3xl font-bold ${s.overallScore >= 80 ? 'text-teal-400' : s.overallScore >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
            {s.overallScore}<span className="text-sm text-slate-500">/100</span>
          </div>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex-1">
          <div className="text-xs text-teal-400 font-medium mb-1">☀ Daytime</div>
          <p className="text-xs text-slate-300">{s.daytime}</p>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex-1">
          <div className="text-xs text-amber-400 font-medium mb-1">🌙 Night</div>
          <p className="text-xs text-slate-300">{s.nighttime}</p>
        </div>
      </div>

      {/* Neighbourhoods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-teal-500/5 border border-teal-500/20 p-4">
          <div className="text-xs text-teal-400 font-medium mb-2">Safe zones</div>
          <ul className="space-y-1">
            {s.safeZones.map(z => (
              <li key={z} className="text-xs text-slate-300 flex items-center gap-1.5">
                <span className="text-teal-500">✓</span> {z}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
          <div className="text-xs text-amber-400 font-medium mb-2">Exercise caution</div>
          <ul className="space-y-1">
            {s.cautionZones.map(z => (
              <li key={z} className="text-xs text-slate-300 flex items-center gap-1.5">
                <span className="text-amber-500">△</span> {z}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Racism / inclusion */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 font-medium mb-2">Racism & inclusion climate</div>
        <p className="text-sm text-slate-300 leading-relaxed">{s.racismClimate}</p>
      </div>

      {/* Forum insights */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 font-medium mb-3">Student-reported insights</div>
        <div className="space-y-3">
          {s.nuancedInsights.map((insight, i) => {
            const [quote, ...rest] = insight.split(' — ')
            const author = rest.join(' — ')
            return (
              <div key={i} className="text-xs leading-relaxed">
                <span className="text-slate-300 italic">"{quote}"</span>
                {author && <span className="text-slate-500 ml-1">— {author}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CostTab({ city }) {
  return (
    <div className="space-y-6">
      {/* Forecast chart */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <CostForecastChart
          data={city.costForecast}
          currency={city.forecastCurrency === 'USD' ? '$' : '€'}
          forecastNote={city.forecastNote}
        />
      </div>

      {/* Cost breakdown */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h4 className="font-semibold text-slate-200 mb-4">Full cost breakdown</h4>
        <div className="space-y-3">
          {[
            ['Shared room (monthly)', city.cost.avgRentShared],
            ['Studio / solo (monthly)', city.cost.avgRentStudio],
            ['Total monthly living', city.cost.avgMonthlyTotal],
            ['Groceries / month', city.cost.groceriesMonthly],
            ['Meal out (mid-range)', city.cost.mealOutAvg],
            ['Public transport', city.cost.publicTransportMonthly],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm border-b border-slate-800 pb-2 last:border-0 last:pb-0">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium text-slate-200">{val}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">Source: {city.cost.source}</p>
      </div>

      {/* Housing options */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h4 className="font-semibold text-slate-200 mb-3">Housing options</h4>
        <ul className="space-y-2 mb-4">
          {city.housing.options.map((o, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">•</span>
              {o}
            </li>
          ))}
        </ul>
        <div className="text-xs text-slate-500 mb-1">Lead time required</div>
        <p className="text-sm text-slate-300 mb-3">{city.housing.avgLeadTime}</p>
        <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-3">
          <div className="text-xs text-teal-400 font-medium mb-1">💡 Insider tip</div>
          <p className="text-xs text-slate-300 leading-relaxed">{city.housing.insiderTip}</p>
        </div>
      </div>
    </div>
  )
}

function SocialTab({ city }) {
  const d = city.demographics
  const s = city.social
  const r = city.religion
  return (
    <div className="space-y-5">
      {/* Local personality */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">What the locals are actually like</div>
        <p className="text-sm text-slate-300 leading-relaxed">{d.localPersonality}</p>
      </div>

      {/* Alcohol & social style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Alcohol culture</div>
          <p className="text-sm text-slate-300 leading-relaxed">{d.alcoholCulture}</p>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-xs text-slate-500 mb-1">Quiet vs. party</div>
          <p className="text-sm text-slate-300 leading-relaxed">{d.quietVsParty}</p>
        </div>
      </div>

      {/* Religion / halal */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-2">Religious infrastructure</div>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-violet-400 font-medium">Mosques nearby: </span>
            <span className="text-xs text-slate-300">{r.mosques.join(' · ')}</span>
          </div>
          <div>
            <span className="text-xs text-violet-400 font-medium">Halal food: </span>
            <span className="text-xs text-slate-300">{r.halalFood}</span>
          </div>
          {r.prayerSpaces && (
            <div>
              <span className="text-xs text-violet-400 font-medium">Prayer spaces: </span>
              <span className="text-xs text-slate-300">{r.prayerSpaces}</span>
            </div>
          )}
        </div>
      </div>

      {/* Events & outdoors */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-2">Events & social highlights</div>
        <p className="text-sm text-slate-300 leading-relaxed mb-3">{s.eventsHighlight}</p>
        <div className="text-xs text-slate-500 mb-2">Outdoor & adventure options</div>
        <ul className="space-y-1">
          {s.outdoors.map((o, i) => (
            <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
              <span className="text-teal-500">→</span> {o}
            </li>
          ))}
        </ul>
      </div>

      {/* Weather */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-xs text-slate-500 mb-1">Weather reality check</div>
        <p className="text-sm text-slate-300">{s.weather}</p>
        {s.hiddenGem && (
          <div className="mt-3 rounded-lg bg-violet-500/5 border border-violet-500/20 p-3">
            <div className="text-xs text-violet-400 font-medium mb-1">Hidden gem</div>
            <p className="text-xs text-slate-300">{s.hiddenGem}</p>
          </div>
        )}
      </div>
    </div>
  )
}
