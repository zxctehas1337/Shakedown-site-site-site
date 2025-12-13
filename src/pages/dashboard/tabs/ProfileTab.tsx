import { RefObject } from 'react'
import { User, UserProfile } from '../../../types'

interface Props {
  user: User
  badge: { text: string; class: string }
  profileForm: UserProfile
  setProfileForm: (form: UserProfile) => void
  avatarInputRef: RefObject<HTMLInputElement | null>
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleProfileSave: () => void
  t: any
}

export function ProfileTab({
  user,
  badge,
  profileForm,
  setProfileForm,
  avatarInputRef,
  handleAvatarChange,
  handleProfileSave,
  t
}: Props) {
  return (
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
  )
}
