import { User } from '../../../types'

interface Props {
  user: User
  formatDate: (date: string) => string
  t: any
}

export function SettingsTab({ user, formatDate, t }: Props) {
  return (
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
  )
}
