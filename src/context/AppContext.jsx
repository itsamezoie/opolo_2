import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const DEFAULT_PROFILE = {
  name: '', nationality: '', age: '',
  fieldOfStudy: '', degreeLevel: '',
  weights: { career: 7, cost: 6, safety: 7, social: 5, diversity: 5, healthcare: 5 },
  religion: 'none', alcoholComfort: 'fine',
  socialStyle: 'community_active', budget: '1000_1500', startDate: 'sep_2026',
}

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try { const s = localStorage.getItem('hf_profile'); return s ? JSON.parse(s) : DEFAULT_PROFILE }
    catch { return DEFAULT_PROFILE }
  })
  const [selectedCityId, setSelectedCityId] = useState(() => localStorage.getItem('hf_city') || 'netherlands')
  const [tolerances, setTolerances] = useState({})
  const [checklistProgress, setChecklistProgress] = useState(() => {
    try { const s = localStorage.getItem('hf_checklist'); return s ? JSON.parse(s) : {} }
    catch { return {} }
  })
  const [visaAnswers, setVisaAnswers] = useState({})

  useEffect(() => { try { localStorage.setItem('hf_profile', JSON.stringify(profile)) } catch {} }, [profile])
  useEffect(() => { try { localStorage.setItem('hf_city', selectedCityId) } catch {} }, [selectedCityId])
  useEffect(() => { try { localStorage.setItem('hf_checklist', JSON.stringify(checklistProgress)) } catch {} }, [checklistProgress])

  const updateProfile = (updates) => setProfile(p => ({ ...p, ...updates }))

  const toggleChecklistItem = (cityId, itemId) =>
    setChecklistProgress(prev => {
      const city = prev[cityId] || {}
      return { ...prev, [cityId]: { ...city, [itemId]: !city[itemId] } }
    })

  const getChecklistCount = (cityId, items) => {
    const prog = checklistProgress[cityId] || {}
    const done = items.filter(i => prog[i.id]).length
    return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 }
  }

  const isProfileComplete = () => !!(profile.name && profile.nationality && profile.fieldOfStudy)

  return (
    <AppContext.Provider value={{
      profile, updateProfile, setProfile,
      selectedCityId, setSelectedCityId,
      tolerances, setTolerances,
      checklistProgress, toggleChecklistItem, getChecklistCount,
      visaAnswers, setVisaAnswers,
      isProfileComplete,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
