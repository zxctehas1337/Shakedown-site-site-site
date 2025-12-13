import { useNavigate, Link } from 'react-router-dom'
import LanguageSelector from './ThemeLanguageSelector'
import { CLIENT_INFO } from '../utils/constants'
import { useTranslation } from '../hooks/useTranslation'

interface NavigationProps {
  onLanguageChange: () => void
}

export default function Navigation({ onLanguageChange }: NavigationProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <img src="/icon.ico" alt="Shakedown Logo" className="nav-logo" />
        <div className="brand-info">
          <span className="brand-name">{CLIENT_INFO.name}</span>
        </div>
      </Link>
      <div className="nav-links">
        <button onClick={() => navigate('/pricing')} className="nav-link">{t.nav.services}</button>
        <button onClick={() => navigate('/news')} className="nav-link">{t.nav.news}</button>
        <LanguageSelector 
          onLanguageChange={onLanguageChange}
        />
        <button onClick={() => navigate('/auth')} className="nav-button-login">{t.nav.dashboard}</button>
      </div>
    </nav>
  )
}
