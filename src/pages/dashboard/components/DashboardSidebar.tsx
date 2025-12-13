import { useNavigate } from 'react-router-dom'
import LanguageSelector from '../../../components/ThemeLanguageSelector'
import { User } from '../../../types'
import { CLIENT_INFO } from '../../../utils/constants'
import { TabType } from '../hooks/useDashboard'

interface Props {
  user: User
  badge: { text: string; class: string }
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  setShowLogoutModal: (show: boolean) => void
  t: any
}

export function DashboardSidebar({
  user,
  badge,
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  setShowLogoutModal,
  t
}: Props) {
  const navigate = useNavigate()

  return (
    <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <img src="/icon.ico" alt="Shakedown" className="sidebar-logo" />
        <div className="sidebar-brand">
          <span className="brand-name">{CLIENT_INFO.name}</span>
          <span className="brand-version">{CLIENT_INFO.version}</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="user-info">
          <span className="user-name">{user.profile?.displayName || user.username}</span>
          <span className={`user-badge ${badge.class}`}>{badge.text}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-language-selector">
          <LanguageSelector dropdownDirection="down" />
        </div>
        <button onClick={(e) => { e.stopPropagation(); navigate('/'); setMobileMenuOpen(false); }} className="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          {t.nav.home}
        </button>
        <button onClick={(e) => { e.stopPropagation(); navigate('/news'); setMobileMenuOpen(false); }} className="nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
          </svg>
          {t.nav.news}
        </button>
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('overview'); setMobileMenuOpen(false); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          {t.dashboard.overview}
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('profile'); setMobileMenuOpen(false); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
          {t.dashboard.profile}
        </button>
        <button 
          className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('subscription'); setMobileMenuOpen(false); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          {t.dashboard.subscription}
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('settings'); setMobileMenuOpen(false); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          {t.dashboard.settings}
        </button>
      </nav>

      <div className="sidebar-links">
        {user.isAdmin && (
          <button onClick={(e) => { e.stopPropagation(); navigate('/admin'); setMobileMenuOpen(false); }} className="link-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {t.dashboard.adminPanel}
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        <button onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); }} className="logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {t.nav.logout}
        </button>
      </div>
    </aside>
  )
}
