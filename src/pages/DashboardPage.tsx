import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import PaymentModal from '../components/PaymentModal'
import Notification from '../components/Notification'
import LanguageSelector from '../components/ThemeLanguageSelector'
import { LogoutModal } from '../components/LogoutModal'
import { getCurrentUser, setCurrentUser } from '../utils/database'
import { User, NotificationType, LicenseKey, UserProfile } from '../types'
import { CLIENT_INFO, DOWNLOAD_LINKS } from '../utils/constants'
import { useTranslation } from '../hooks/useTranslation'
import '../styles/dashboard/DashboardBase.css'
import '../styles/dashboard/DashboardNavbar.css'
import '../styles/dashboard/DashboardProfile.css'
import '../styles/dashboard/DashboardActions.css'
import '../styles/dashboard/DashboardAnimations.css'
import '../styles/dashboard/DashboardResponsive.css'
import '../styles/dashboard/DashboardProfileTab.css'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [keyInput, setKeyInput] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'subscription' | 'settings'>('overview')
  const [profileForm, setProfileForm] = useState<UserProfile>({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { t, dateLocale } = useTranslation()

  useEffect(() => {
    const userData = getCurrentUser()
    if (!userData) {
      navigate('/auth')
    } else {
      setUser(userData)
      setProfileForm(userData.profile || {})
    }
  }, [navigate])

  const handleLogout = () => {
    setCurrentUser(null)
    navigate('/auth')
  }

  const handleBuyClient = (productId?: string) => {
    setSelectedProductId(productId || '')
    setShowPaymentModal(true)
  }

  const handleActivateKey = () => {
    if (!keyInput.trim()) {
      setNotification({ message: t.dashboard.enterKeyToActivate, type: 'error' })
      return
    }

    const licenseKeys: LicenseKey[] = JSON.parse(localStorage.getItem('insideLicenseKeys') || '[]')
    const keyIndex = licenseKeys.findIndex(k => k.key === keyInput.trim().toUpperCase())
    
    if (keyIndex === -1) {
      setNotification({ message: t.dashboard.keyNotFound, type: 'error' })
      return
    }

    const licenseKey = licenseKeys[keyIndex]

    if (licenseKey.isUsed) {
      setNotification({ message: t.dashboard.keyAlreadyUsed, type: 'error' })
      return
    }

    licenseKeys[keyIndex] = {
      ...licenseKey,
      isUsed: true,
      usedAt: new Date().toISOString(),
      usedBy: user?.id
    }

    localStorage.setItem('insideLicenseKeys', JSON.stringify(licenseKeys))

    if (user) {
      let newSubscription: 'free' | 'premium' | 'alpha' = user.subscription
      
      if (licenseKey.product === 'premium' || licenseKey.product === 'inside-client') {
        newSubscription = 'premium'
      } else if (licenseKey.product === 'alpha') {
        newSubscription = 'alpha'
      }

      const updatedUser = { ...user, subscription: newSubscription }
      setCurrentUser(updatedUser)
      setUser(updatedUser)

      const users: User[] = JSON.parse(localStorage.getItem('insideUsers') || '[]')
      const userIndex = users.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem('insideUsers', JSON.stringify(users))
      }
    }

    const productNames: Record<string, string> = {
      'premium': 'Premium',
      'alpha': 'Alpha',
      'inside-client': 'Shakedown Client',
      'inside-spoofer': 'Shakedown Spoofer',
      'inside-cleaner': 'Shakedown Cleaner'
    }

    const durationText = licenseKey.duration === 0 
      ? t.dashboard.forever 
      : t.dashboard.forDays.replace('{days}', String(licenseKey.duration))
    setNotification({ message: `${t.dashboard.keyActivated} ${productNames[licenseKey.product]} ${durationText}`, type: 'success' })
    setKeyInput('')
  }

  const handleDownloadLauncher = () => {
    window.location.href = DOWNLOAD_LINKS.launcher
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      setNotification({ message: t.dashboard.fileTooLarge, type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      if (user) {
        const updatedUser = { ...user, avatar: base64 }
        updateUserData(updatedUser)
        setNotification({ message: t.dashboard.avatarUpdated, type: 'success' })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleProfileSave = () => {
    if (!user) return

    // Проверка уникальности имени
    if (profileForm.displayName && profileForm.displayName.trim()) {
      const users: User[] = JSON.parse(localStorage.getItem('insideUsers') || '[]')
      const nameTaken = users.some(u => 
        u.id !== user.id && 
        (u.profile?.displayName?.toLowerCase() === profileForm.displayName?.toLowerCase() ||
         u.username.toLowerCase() === profileForm.displayName?.toLowerCase())
      )
      if (nameTaken) {
        setNotification({ message: t.dashboard.nameTaken, type: 'error' })
        return
      }
    }

    const updatedUser = { ...user, profile: { displayName: profileForm.displayName } }
    updateUserData(updatedUser)
    setNotification({ message: t.dashboard.profileSaved, type: 'success' })
  }

  const updateUserData = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    setUser(updatedUser)

    const users: User[] = JSON.parse(localStorage.getItem('insideUsers') || '[]')
    const userIndex = users.findIndex(u => u.id === updatedUser.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem('insideUsers', JSON.stringify(users))
    }
  }

  if (!user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSubscriptionBadge = () => {
    switch (user.subscription) {
      case 'alpha': return { text: 'Alpha', class: 'badge-alpha' }
      case 'premium': return { text: 'Premium', class: 'badge-premium' }
      default: return { text: 'Free', class: 'badge-free' }
    }
  }

  const badge = getSubscriptionBadge()

  return (
    <div className="dashboard-page">
      <AnimatedBackground />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {showLogoutModal && (
        <LogoutModal
          isOpen={showLogoutModal}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          productId={selectedProductId}
        />
      )}

      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <img src="/icon.ico" alt="Shakedown" className="mobile-logo" />
          <span className="mobile-brand">{CLIENT_INFO.name}</span>
        </div>
        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
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
            <span className="user-name">{user.username}</span>
            <span className={`user-badge ${badge.class}`}>{badge.text}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {t.nav.home}
          </button>
          <button onClick={() => { navigate('/news'); setMobileMenuOpen(false); }} className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
            </svg>
            {t.nav.news}
          </button>
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
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
            onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
            {t.dashboard.profile}
          </button>
          <button 
            className={`nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => { setActiveTab('subscription'); setMobileMenuOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            {t.dashboard.subscription}
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
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
            <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="link-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {t.dashboard.adminPanel}
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <LanguageSelector dropdownDirection="up" />
          <button onClick={() => setShowLogoutModal(true)} className="logout-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t.nav.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>{t.dashboard.welcome}, {user.username}!</h1>
              <p>{t.dashboard.manageAccount}</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{t.dashboard.status}</span>
                  <span className={`stat-value ${badge.class}`}>{badge.text}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{t.dashboard.registration}</span>
                  <span className="stat-value">{formatDate(user.registeredAt)}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{t.dashboard.emailStatus}</span>
                  <span className="stat-value">{user.emailVerified ? t.dashboard.verified : t.dashboard.notVerified}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M8 21h8M12 17v4"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">{t.dashboard.hwid}</span>
                  <span className="stat-value hwid">{t.dashboard.notLinked}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>{t.dashboard.quickActions}</h2>
              <div className="actions-grid">
                <button className="action-card primary" onClick={() => handleBuyClient()}>
                  <div className="action-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </div>
                  <span className="action-title">{t.dashboard.buyClient}</span>
                </button>

                <button className="action-card" onClick={handleDownloadLauncher}>
                  <div className="action-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <span className="action-title">{t.dashboard.downloadLauncher}</span>
                </button>

                <button className="action-card" onClick={() => setActiveTab('subscription')}>
                  <div className="action-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                    </svg>
                  </div>
                  <span className="action-title">{t.dashboard.activateKey}</span>
                </button>

                <button className="action-card" onClick={() => navigate('/news')}>
                  <div className="action-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <span className="action-title">{t.dashboard.news}</span>
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="profile-card">
              <h2>{t.dashboard.profileInfo}</h2>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">{t.dashboard.uid}</span>
                  <span className="detail-value mono">{user.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.dashboard.login}</span>
                  <span className="detail-value">{user.username}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.dashboard.email}</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t.dashboard.subscription}</span>
                  <span className={`detail-value ${badge.class}`}>{badge.text}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>{t.dashboard.myProfile}</h1>
              <p>{t.dashboard.setupProfile}</p>
            </div>

            {/* Avatar Section */}
            <div className="profile-avatar-section">
              <div className="avatar-preview">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span>{user.username.charAt(0).toUpperCase()}</span>
                )}
                <button 
                  className="avatar-edit-btn"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="avatar-info">
                <h3>{profileForm.displayName || user.username}</h3>
                <span className={`profile-badge ${badge.class}`}>{badge.text}</span>
              </div>
            </div>

            {/* Profile Form */}
            <div className="profile-form-section">
              <h2>{t.dashboard.basicInfo}</h2>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>{t.dashboard.displayName}</label>
                  <input
                    type="text"
                    placeholder={user.username}
                    value={profileForm.displayName || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    onBlur={handleProfileSave}
                    maxLength={20}
                  />
                  <span className="form-hint">{t.dashboard.displayNameHint}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>{t.dashboard.subscription}</h1>
              <p>{t.dashboard.subscriptionManagement}</p>
            </div>

            <div className="subscription-status">
              <div className="current-plan">
                <div className={`plan-badge ${badge.class}`}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div className="plan-info">
                  <h3>{t.dashboard.currentPlan}: {badge.text}</h3>
                  <p>{user.subscription === 'free' ? t.dashboard.upgradeForFeatures : t.dashboard.activeSubscription}</p>
                </div>
              </div>
            </div>

            <div className="key-activation">
              <h2>{t.dashboard.keyActivation}</h2>
              <div className="key-input-group">
                <input
                  type="text"
                  className="key-input"
                  placeholder={t.dashboard.keyPlaceholder}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                />
                <button className="activate-btn" onClick={handleActivateKey}>
                  {t.dashboard.activate}
                </button>
              </div>
              <p className="key-hint">{t.dashboard.keyHint}</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>{t.dashboard.settings}</h1>
              <p>{t.dashboard.subscriptionManagement}</p>
            </div>

            <div className="settings-section">
              <h2>{t.dashboard.security}</h2>
              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t.dashboard.changePassword}</h4>
                    <p>{t.dashboard.changePasswordDesc}</p>
                  </div>
                  <button className="setting-btn">{t.dashboard.change}</button>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t.dashboard.resetHwid}</h4>
                    <p>{t.dashboard.resetHwidDesc}</p>
                  </div>
                  <button className="setting-btn">{t.dashboard.reset}</button>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h2>{t.dashboard.account}</h2>
              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t.dashboard.email}</h4>
                    <p>{user.email}</p>
                  </div>
                  <span className={`email-status ${user.emailVerified ? 'verified' : ''}`}>
                    {user.emailVerified ? t.dashboard.verified : t.dashboard.notVerified}
                  </span>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t.dashboard.regDate}</h4>
                    <p>{formatDate(user.registeredAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
