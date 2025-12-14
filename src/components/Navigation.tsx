import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import LanguageSelector from './ThemeLanguageSelector'
import LogoWithHat from './LogoWithHat'
import { IconHome, IconDollar, IconNews, IconDownload, IconUser } from './Icons'
import { CLIENT_INFO } from '../utils/constants'
import { useTranslation } from '../hooks/useTranslation'
import { getCurrentUser } from '../utils/database'

interface NavigationProps {
  onLanguageChange: () => void
}

export default function Navigation({ onLanguageChange }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isAuthed, setIsAuthed] = useState<boolean>(() => !!getCurrentUser())
  const [currentUser, setCurrentUser] = useState<any>(null)
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const updateAuth = () => {
      const user = getCurrentUser()
      setIsAuthed(!!user)
      setCurrentUser(user)
    }

    updateAuth()
    window.addEventListener('storage', updateAuth)
    window.addEventListener('currentUserChanged', updateAuth)

    return () => {
      window.removeEventListener('storage', updateAuth)
      window.removeEventListener('currentUserChanged', updateAuth)
    }
  }, [])

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="nav-brand"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="nav-logo-container">
          <LogoWithHat
            alt="Shakedown Logo"
            size={42}
            className="nav-logo no-user-drag"
            hatClassName="nav-logo-hat"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
        <div className="brand-info">
          <span className="brand-name">{CLIENT_INFO.name}</span>
        </div>
      </Link>
      <div className="nav-links">
        {!isHomePage && (
          <button onClick={() => navigate('/')} className="nav-link"><IconHome />{t.nav.home}</button>
        )}
        <button onClick={() => navigate('/pricing')} className="nav-link"><IconDollar />{t.nav.services}</button>
        <button onClick={() => navigate('/news')} className="nav-link"><IconNews />{t.nav.news}</button>
        {isAuthed && (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openSoonModal'))
            }}
            className="nav-link"
          >
            <IconDownload />{t.dashboard.downloadLauncher}
          </button>
        )}
        <LanguageSelector 
          onLanguageChange={onLanguageChange}
        />
        {currentUser ? (
          <button onClick={() => navigate('/dashboard')} className="nav-button-login" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src={currentUser.avatar || '/icon.ico'} 
              alt="Avatar" 
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                objectFit: 'cover'
              }} 
            />
            {currentUser.username}
          </button>
        ) : (
          <button onClick={() => navigate('/auth')} className="nav-button-login"><IconUser />{t.nav.dashboard}</button>
        )}
      </div>
    </nav>
  )
}
