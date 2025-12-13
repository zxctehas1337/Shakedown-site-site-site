import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../../components/Notification'
import { NotificationType } from '../../types'
import { useFeatureSlider } from './hooks/useFeatureSlider'
import { useOAuthCallback } from './hooks/useOAuthCallback'
import { FeatureSlider } from './components/FeatureSlider'
import { SocialButtons } from './components/SocialButtons'
import { AdminLoginForm } from './components/AdminLoginForm'
import { VerificationModal } from './components/VerificationModal'
import { getCurrentUser } from '../../utils/database'
import '../../styles/auth/AuthBase.css'
import '../../styles/auth/AuthForm.css'
import '../../styles/auth/AuthSlider.css'
import '../../styles/auth/AuthModal.css'
import '../../styles/auth/AuthResponsive.css'

export default function AuthPage() {
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null)
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [pendingUserId] = useState<string | null>(null)
  const navigate = useNavigate()
  
  const { currentFeature, setCurrentFeature } = useFeatureSlider()
  
  useOAuthCallback({ setNotification })

  // Редирект если пользователь уже авторизован
  useEffect(() => {
    // Проверяем только если нет OAuth callback параметров в URL
    const params = new URLSearchParams(window.location.search)
    const hasOAuthCallback = params.get('auth') || params.get('error')
    
    if (!hasOAuthCallback) {
      const user = getCurrentUser()
      if (user) {
        if (user.isAdmin) {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }
    }
  }, [navigate])

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
              <img
                src="/icon.ico"
                alt="ShakeDown"
                width="40"
                height="40"
                className="no-user-drag"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
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
