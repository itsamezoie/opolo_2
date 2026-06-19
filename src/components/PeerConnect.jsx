import { MessageCircle, Clock, Star, Globe } from 'lucide-react'

// Compute approximate time offset from user's browser
function getLocalTimeInZone(timezoneOffset) {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const cityOffset = timezoneOffset === 'CET (UTC+1)' ? 1 : timezoneOffset === 'EST (UTC-5)' ? -5 : 0
  const cityTime = new Date(utcMs + cityOffset * 3600000)
  return cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getTimeDiff(timezoneOffset) {
  const userOffset = -(new Date().getTimezoneOffset() / 60)
  const cityOffset = timezoneOffset === 'CET (UTC+1)' ? 1 : timezoneOffset === 'EST (UTC-5)' ? -5 : 0
  const diff = cityOffset - userOffset
  if (diff === 0) return 'Same timezone as you'
  return `${diff > 0 ? '+' : ''}${diff} hrs from you`
}

export default function PeerConnect({ ambassador }) {
  const localTime = getLocalTimeInZone(ambassador.timezone)
  const timeDiff  = getTimeDiff(ambassador.timezone)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h3 className="font-semibold text-slate-200 mb-4">Talk to a student who lives there</h3>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full ${ambassador.avatarColor || 'bg-violet-600'} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
          {ambassador.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100">{ambassador.name}</span>
            <span className="text-slate-500 text-sm">· from {ambassador.from}</span>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm text-amber-400 font-medium">{ambassador.rating}</span>
            </div>
          </div>
          <div className="text-sm text-slate-400 mt-0.5">{ambassador.program}</div>
          <div className="text-sm text-slate-500">{ambassador.university}</div>
        </div>
      </div>

      {/* Info pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-400">
          <Clock className="w-3 h-3 text-teal-400" />
          <span>Local time: <span className="text-slate-200 font-medium">{localTime}</span></span>
          <span className="text-slate-600">·</span>
          <span className="text-teal-400">{timeDiff}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-lg text-xs text-slate-400">
          <Globe className="w-3 h-3 text-violet-400" />
          {ambassador.languages.join(' · ')}
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-slate-400 leading-relaxed mt-3">{ambassador.bio}</p>

      {/* Response time */}
      <div className="flex items-center gap-1.5 mt-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-xs text-slate-500">{ambassador.responseTime}</span>
      </div>

      <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-medium text-sm transition-all hover:scale-105">
        <MessageCircle className="w-4 h-4" />
        Send a message
      </button>

      <p className="text-xs text-slate-600 text-center mt-2">Peer messaging coming soon — feature in development</p>
    </div>
  )
}
