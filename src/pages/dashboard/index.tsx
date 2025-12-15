import { useEffect } from 'react'
import AnimatedBackground from '../../components/AnimatedBackground'
import Notification from '../../components/Notification'
import { LogoutModal } from '../../components/LogoutModal'
import { SoonModal } from '../../components/SoonModal'
import { MobileHeader, DashboardSidebar } from './components'
import { OverviewTab, ProfileTab, SubscriptionTab, SettingsTab } from './tabs'
import { useDashboard } from './hooks/useDashboard'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import '../../styles/dashboard/DashboardNavbar.css'
import '../../styles/dashboard/DashboardProfile.css'
import '../../styles/dashboard/DashboardActions.css'
import '../../styles/dashboard/DashboardAnimations.css'
import '../../styles/dashboard/DashboardResponsive.css'
import '../../styles/dashboard/DashboardBase.css'
import '../../styles/dashboard/DashboardProfileTab.css'

export default function DashboardPage() {
  const {
    user,
    notification,
    setNotification,
    showLogoutModal,
    setShowLogoutModal,
    showSoonModal,
    setShowSoonModal,
    keyInput,
    setKeyInput,
    activeTab,
    setActiveTab,
    profileForm,
    setProfileForm,
    mobileMenuOpen,
    setMobileMenuOpen,
    avatarInputRef,
    t,
    handleLogout,
    handleBuyClient,
    handleActivateKey,
    handleDownloadLauncher,
    handleAvatarChange,
    handleProfileSave,
    formatDate,
    getSubscriptionBadge
  } = useDashboard()

  const location = useLocation()
  const navigate = useNavigate()

  const setTabAndNavigate = (tab: typeof activeTab) => {
    setActiveTab(tab)
    navigate(`/dashboard/${tab}`)
  }

  const getTabFromPathname = (pathname: string) => {
    const path = pathname.replace(/^\/dashboard\/?/, '')
    const segment = path.split('/')[0]

    if (segment === 'overview' || segment === 'profile' || segment === 'subscription' || segment === 'settings') {
      return segment
    }

    return 'profile'
  }

  useEffect(() => {
    const routeTab = getTabFromPathname(location.pathname)
    if (routeTab !== activeTab) {
      setActiveTab(routeTab)
    }
  }, [activeTab, location.pathname, setActiveTab])

  if (!user) return null

  const badge = getSubscriptionBadge(user.subscription)

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

      {showSoonModal && (
        <SoonModal
          isOpen={showSoonModal}
          title="Soon..."
          message="Скоро"
          onClose={() => setShowSoonModal(false)}
        />
      )}

      <MobileHeader 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <DashboardSidebar
        user={user}
        badge={badge}
        activeTab={activeTab}
        setActiveTab={setTabAndNavigate}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setShowLogoutModal={setShowLogoutModal}
        t={t}
      />

      <main className="dashboard-main">
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route
            path="overview"
            element={
              <OverviewTab
                user={user}
                badge={badge}
                formatDate={formatDate}
                handleBuyClient={handleBuyClient}
                handleDownloadLauncher={handleDownloadLauncher}
                setActiveTab={setTabAndNavigate}
                t={t}
              />
            }
          />
          <Route
            path="profile"
            element={
              <ProfileTab
                user={user}
                badge={badge}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                avatarInputRef={avatarInputRef}
                handleAvatarChange={handleAvatarChange}
                handleProfileSave={handleProfileSave}
                t={t}
              />
            }
          />
          <Route
            path="subscription"
            element={
              <SubscriptionTab
                user={user}
                badge={badge}
                keyInput={keyInput}
                setKeyInput={setKeyInput}
                handleActivateKey={handleActivateKey}
                t={t}
              />
            }
          />
          <Route path="settings" element={<SettingsTab user={user} formatDate={formatDate} t={t} />} />
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Routes>
      </main>
    </div>
  )
}
