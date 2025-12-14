import { useNavigate } from 'react-router-dom'
import LanguageSelector from '../../../components/ThemeLanguageSelector'
import LogoWithHat from '../../../components/LogoWithHat'
import { IconHome, IconNews, IconGrid, IconProfile, IconStar, IconSettings, IconShield, IconLogout } from '../../../components/Icons'
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
        <LogoWithHat
          alt="Shakedown"
          size={40}
          className="sidebar-logo no-user-drag"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
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
          <IconHome />
          {t.nav.home}
        </button>
        <button onClick={(e) => { e.stopPropagation(); navigate('/news'); setMobileMenuOpen(false); }} className="nav-item">
          <IconNews />
          {t.nav.news}
        </button>
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('overview'); setMobileMenuOpen(false); }}
        >
          <IconGrid />
          {t.dashboard.overview}
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('profile'); setMobileMenuOpen(false); }}
        >
          <IconProfile />
          {t.dashboard.profile}
        </button>
        <button 
          className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('subscription'); setMobileMenuOpen(false); }}
        >
          <IconStar />
          {t.dashboard.subscription}
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setActiveTab('settings'); setMobileMenuOpen(false); }}
        >
          <IconSettings />
          {t.dashboard.settings}
        </button>
      </nav>

      <div className="sidebar-links">
        {user.isAdmin && (
          <button onClick={(e) => { e.stopPropagation(); navigate('/admin'); setMobileMenuOpen(false); }} className="link-item">
            <IconShield size={18} />
            {t.dashboard.adminPanel}
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        <button onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); }} className="logout-btn">
          <IconLogout size={18} />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  )
}
