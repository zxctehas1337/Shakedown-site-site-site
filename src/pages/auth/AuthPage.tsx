import { useState } from 'react'
import Notification from '../../components/Notification'
import { NotificationType } from '../../types'
import { useFeatureSlider } from './hooks/useFeatureSlider'
import { useOAuthCallback } from './hooks/useOAuthCallback'
import { FeatureSlider } from './components/FeatureSlider'
import { SocialButtons } from './components/SocialButtons'
import { AdminLoginForm } from './components/AdminLoginForm'
import { VerificationModal } from './components/VerificationModal'
import '../../styles/AuthPage.css'

export default function AuthPage() {
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [pendingUserId] = useState<string | null>(null)
  
  const { currentFeature, setCurrentFeature } = useFeatureSlider()
  
  useOAuthCallback({ setNotification })

  return (
    <div className="auth-page-split">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <FeatureSlider 
        currentFeature={currentFeature} 
        setCurrentFeature={setCurrentFeature} 
      />

      <div className="auth-right-panel">
        <div className="auth-box-clean">
          <div className="auth-header">
            <div className="auth-logo-small">
              <img src="/icon.ico" alt="ShakeDown" width="40" height="40" />
            </div>
            <div className="auth-title-clean">
              <h2>Добро пожаловать</h2>
              <p>Войдите в свой аккаунт чтобы продолжить</p>
            </div>
          </div>

          <div className="auth-form-clean">
            {!isAdminMode ? (
              <>
                <SocialButtons />

                <div className="divider-clean">
                  <span>или</span>
                </div>

                <button
                  onClick={() => setIsAdminMode(true)}
                  className="btn-text-only"
                >
                  Войти как администратор
                </button>
              </>
            ) : (
              <AdminLoginForm 
                setNotification={setNotification}
                onBack={() => setIsAdminMode(false)}
              />
            )}
          </div>

          <div className="auth-footer-clean">
            <a href="/" className="back-link-clean">
              На главную
            </a>
            <span className="version-tag">v3.1.9</span>
          </div>
        </div>
      </div>

      {showVerificationModal && (
        <VerificationModal
          pendingUserId={pendingUserId}
          setNotification={setNotification}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  )
}
