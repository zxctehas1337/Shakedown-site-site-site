import { User } from '../../../types'

interface Props {
  user: User
  badge: { text: string; class: string }
  keyInput: string
  setKeyInput: (value: string) => void
  handleActivateKey: () => void
  t: any
}

export function SubscriptionTab({
  user,
  badge,
  keyInput,
  setKeyInput,
  handleActivateKey,
  t
}: Props) {
  return (
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
  )
}
