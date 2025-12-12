import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import PaymentModal from '../components/PaymentModal'
import Notification from '../components/Notification'
import LanguageSelector from '../components/ThemeLanguageSelector'
import { LogoutModal } from '../components/LogoutModal'
import { getCurrentUser, setCurrentUser } from '../utils/database'
import { User, NotificationType, LicenseKey } from '../types'
import { CLIENT_INFO, DOWNLOAD_LINKS } from '../utils/constants'
import '../styles/DashboardPage.css'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [hwidInput, setHwidInput] = useState('')
  const [keyInput, setKeyInput] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const userData = getCurrentUser()
    if (!userData) {
      navigate('/auth')
    } else {
      setUser(userData)
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

  const handleResetHWID = () => {
    if (!hwidInput.trim()) {
      setNotification({ message: 'Введите HWID для сброса', type: 'error' })
      return
    }
    // Здесь будет логика сброса HWID
    setNotification({ message: 'HWID успешно сброшен!', type: 'success' })
    setHwidInput('')
  }

  const handleActivateKey = () => {
    if (!keyInput.trim()) {
      setNotification({ message: 'Введите ключ для активации', type: 'error' })
      return
    }

    // Получаем все ключи из localStorage
    const licenseKeys: LicenseKey[] = JSON.parse(localStorage.getItem('insideLicenseKeys') || '[]')
    
    // Ищем ключ
    const keyIndex = licenseKeys.findIndex(k => k.key === keyInput.trim().toUpperCase())
    
    if (keyIndex === -1) {
      setNotification({ message: 'Ключ не найден', type: 'error' })
      return
    }

    const licenseKey = licenseKeys[keyIndex]

    if (licenseKey.isUsed) {
      setNotification({ message: 'Этот ключ уже был использован', type: 'error' })
      return
    }

    // Активируем ключ
    licenseKeys[keyIndex] = {
      ...licenseKey,
      isUsed: true,
      usedAt: new Date().toISOString(),
      usedBy: user?.id
    }

    // Сохраняем обновленные ключи
    localStorage.setItem('insideLicenseKeys', JSON.stringify(licenseKeys))

    // Обновляем подписку пользователя
    if (user) {
      let newSubscription: 'free' | 'premium' | 'alpha' = user.subscription
      
      if (licenseKey.product === 'premium' || licenseKey.product === 'inside-client') {
        newSubscription = 'premium'
      } else if (licenseKey.product === 'alpha') {
        newSubscription = 'alpha'
      }

      const updatedUser = {
        ...user,
        subscription: newSubscription
      }

      // Обновляем пользователя в localStorage
      setCurrentUser(updatedUser)
      setUser(updatedUser)

      // Также обновляем в списке пользователей
      const users: User[] = JSON.parse(localStorage.getItem('insideUsers') || '[]')
      const userIndex = users.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem('insideUsers', JSON.stringify(users))
      }
    }

    const productNames: Record<string, string> = {
      'premium': 'Premium подписка',
      'alpha': 'Alpha подписка',
      'inside-client': 'Shakedown Client',
      'inside-spoofer': 'Shakedown Spoofer',
      'inside-cleaner': 'Shakedown Cleaner'
    }

    const durationText = licenseKey.duration === 0 
      ? 'навсегда' 
      : `на ${licenseKey.duration} дней`

    setNotification({ 
      message: `Ключ активирован! ${productNames[licenseKey.product]} ${durationText}`, 
      type: 'success' 
    })
    setKeyInput('')
  }

  const handleDownloadLauncher = () => {
    window.location.href = DOWNLOAD_LINKS.launcher
  }

  if (!user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

      {/* Навигация */}
      <nav className="dashboard-navbar">
        <div className="nav-brand">
          <img src="/icon.ico" alt="Shakedown" className="nav-logo" />
          <div className="brand-info">
            <span className="brand-name">{CLIENT_INFO.name}</span>
            <span className="brand-version">{CLIENT_INFO.version}</span>
          </div>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate('/')} className="nav-btn">Главная</button>
          <button onClick={() => navigate('/news')} className="nav-btn">Новости</button>
          {user.isAdmin && (
            <button onClick={() => navigate('/admin')} className="nav-btn">Админ</button>
          )}
          <LanguageSelector />
          <button onClick={() => setShowLogoutModal(true)} className="nav-btn-logout">Выйти</button>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          
          {/* Личный кабинет */}
          <section className="profile-section">
            <h2 className="section-title">Личный кабинет</h2>
            
            <div className="profile-grid">
              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <path d="M7 8h4M7 12h10M7 16h6"/>
                  </svg>
                </div>
                <div className="field-content">
                  <div className="field-label">UID</div>
                  <div className="field-value">{user.id}</div>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                </div>
                <div className="field-content">
                  <div className="field-label">Логин</div>
                  <div className="field-value">{user.username}</div>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="7" r="3"/>
                    <circle cx="15" cy="7" r="3"/>
                    <path d="M3 18c0-3 3-5 6-5 1.5 0 3 .5 3 .5s1.5-.5 3-.5c3 0 6 2 6 5"/>
                  </svg>
                </div>
                <div className="field-content">
                  <div className="field-label">Группа</div>
                  <div className="field-value">
                    {user.subscription === 'premium' ? 'Premium' : 
                     user.subscription === 'alpha' ? 'Alpha' : 'Пользователь'}
                  </div>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </div>
                <div className="field-content">
                  <div className="field-label">Дата регистрации</div>
                  <div className="field-value">{formatDate(user.registeredAt)}</div>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div className="field-content">
                  <div className="field-label">Последний вход</div>
                  <div className="field-value">{formatDate(user.registeredAt)}</div>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M22 7l-10 7L2 7"/>
                  </svg>
                </div>
                <div className="field-content">
                  <div className="field-label">E-mail</div>
                  <div className="field-value">{user.email}</div>
                </div>
              </div>

              <div className="profile-field full-width">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M8 21h8M12 17v4"/>
                  </svg>
                </div>
                <div className="field-content">
                  <div className="field-label">HWID</div>
                  <div className="field-value hwid-value">
                    Будет получен от лаунчера
                  </div>
                  <button className="field-button" onClick={handleResetHWID}>
                    Сбросить
                  </button>
                </div>
              </div>

              <div className="profile-field full-width">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                  </svg>
                </div>
                <div className="field-content">
                  <div className="field-label">Активация ключа</div>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                  />
                  <button className="field-button" onClick={handleActivateKey}>Активировать</button>
                </div>
              </div>
            </div>
          </section>

          {/* Действия */}
          <section className="actions-section">
            <div className="action-buttons">
              <button className="action-btn primary" onClick={() => handleBuyClient()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.895 17 15 17.895 15 19C15 20.105 15.895 21 17 21C18.105 21 19 20.105 19 19C19 17.895 18.105 17 17 17ZM9 19C9 20.105 8.105 21 7 21C5.895 21 5 20.105 5 19C5 17.895 5.895 17 7 17C8.105 17 9 17.895 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Купить клиент
              </button>

              <button className="action-btn secondary" onClick={handleDownloadLauncher}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Скачать лаунчер
              </button>

              <button className="action-btn secondary" onClick={() => navigate('/news')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 8H17M7 12H17M7 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Новости
              </button>

              <button className="action-btn secondary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Сменить пароль
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
