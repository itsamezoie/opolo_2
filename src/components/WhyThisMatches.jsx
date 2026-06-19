import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function WhyThisMatches({ explanation, cityName }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  // Simulate streaming LLM output
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!explanation) return
    let i = 0
    const interval = setInterval(() => {
      i += 3
      setDisplayed(explanation.slice(0, i))
      if (i >= explanation.length) {
        setDisplayed(explanation)
        setDone(true)
        clearInterval(interval)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [explanation])

  // Render markdown-style **bold** inline
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i} className="text-violet-300 font-semibold">{p.slice(2, -2)}</strong>
      }
      return <span key={i}>{p}</span>
    })
  }

  return (
    <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <h3 className="font-semibold text-sm text-slate-200">Why {cityName} matches you specifically</h3>
        {!done && (
          <span className="ml-auto text-xs text-violet-500 animate-pulse">Generating…</span>
        )}
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">
        {renderText(displayed)}
        {!done && <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />}
      </p>
    </div>
  )
}
