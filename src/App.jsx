import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import AppLayout from './components/AppLayout.jsx'
import Landing from './pages/Landing.jsx'
import Assessment from './pages/Assessment.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RelocationGuide from './pages/RelocationGuide.jsx'
import BudgetMatcher from './pages/BudgetMatcher.jsx'
import VisaPredictor from './pages/VisaPredictor.jsx'
import CommunityHub from './pages/CommunityHub.jsx'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/assess" element={<Assessment />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/budget"     element={<BudgetMatcher />} />
            <Route path="/visa"       element={<VisaPredictor />} />
            <Route path="/guide"      element={<RelocationGuide />} />
            <Route path="/community"  element={<CommunityHub />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
