import { useNavigate } from 'react-router-dom'
import { User } from '../../../types'

interface Props {
  user: User
  badge: { text: string; class: string }
  formatDate: (date: string) => string
  handleBuyClient: (productId?: string) => void
  handleDownloadLauncher: () => void
  setActiveTab: (tab: 'overview' | 'profile' | 'subscription' | 'settings') => void
  t: any
}

export function OverviewTab({
  user,
  badge,
  formatDate,
  handleBuyClient,
  handleDownloadLauncher,
  setActiveTab,
  t
}: Props) {
  const navigate = useNavigate()

  return (
    <div className="dashboard-content">
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
  )
}
