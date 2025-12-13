import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import LanguageSelector from './ThemeLanguageSelector'
import { CLIENT_INFO } from '../utils/constants'
import { useTranslation } from '../hooks/useTranslation'
import { getCurrentUser } from '../utils/database'
import { DOWNLOAD_LINKS } from '../utils/constants'

interface NavigationProps {
  onLanguageChange: () => void
}

export default function Navigation({ onLanguageChange }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isAuthed, setIsAuthed] = useState<boolean>(() => !!getCurrentUser())
  const isHomePage = location.pathname === '/'

  const IconHome = (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )

  const IconDollar = (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )

  const IconNews = (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
    </svg>
  )

  const IconDownload = (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  )

  const IconUser = (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
    </svg>
  )

  useEffect(() => {
    const updateAuth = () => setIsAuthed(!!getCurrentUser())

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
        <img
          src="/icon.ico"
          alt="Shakedown Logo"
          className="nav-logo no-user-drag"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        <div className="brand-info">
          <span className="brand-name">{CLIENT_INFO.name}</span>
        </div>
      </Link>
      <div className="nav-links">
        {!isHomePage && (
          <button onClick={() => navigate('/')} className="nav-link">{IconHome}{t.nav.home}</button>
        )}
        <button onClick={() => navigate('/pricing')} className="nav-link">{IconDollar}{t.nav.services}</button>
        <button onClick={() => navigate('/news')} className="nav-link">{IconNews}{t.nav.news}</button>
        {isAuthed && (
          <button
            onClick={() => {
              window.location.href = DOWNLOAD_LINKS.launcher
            }}
            className="nav-link"
          >
            {IconDownload}{t.dashboard.downloadLauncher}
          </button>
        )}
        <LanguageSelector 
          onLanguageChange={onLanguageChange}
        />
        <button onClick={() => navigate('/auth')} className="nav-button-login">{IconUser}{t.nav.dashboard}</button>
      </div>
    </nav>
  )
}
