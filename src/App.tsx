import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import AuthPage from './pages/auth/AuthPage.tsx'
import DashboardPage from './pages/dashboard/index.tsx'
import AdminPage from './pages/admin/AdminPage.tsx'
import NewsPage from './pages/NewsPage.tsx'
import PricingPage from './pages/PricingPage.tsx'
import { SoonModal } from './components/SoonModal'

function App() {
  const [showSoonModal, setShowSoonModal] = useState(false)

  useEffect(() => {
    const open = () => setShowSoonModal(true)
    window.addEventListener('openSoonModal', open)
    return () => window.removeEventListener('openSoonModal', open)
  }, [])

  return (
    <Router>
      {showSoonModal && (
        <SoonModal
          isOpen={showSoonModal}
          title="Soon..."
          message="Скоро"
          onClose={() => setShowSoonModal(false)}
        />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </Router>
  )
}

export default App
