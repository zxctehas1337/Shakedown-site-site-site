import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, NewsPost, LicenseKey } from '../types'
import Notification from '../components/Notification'
import { LogoutModal } from '../components/LogoutModal'
import '../styles/AdminPage.css'

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'users' | 'activity' | 'keys'>('overview')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  // News state
  const [news, setNews] = useState<NewsPost[]>([])
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'website' as 'launcher' | 'website' })
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Keys state
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([])
  const [keyProduct, setKeyProduct] = useState<LicenseKey['product']>('premium')
  const [keyDuration, setKeyDuration] = useState<number>(30)
  const [keyCount, setKeyCount] = useState<number>(1)
  const [keysSearchQuery, setKeysSearchQuery] = useState('')

  useEffect(() => {
    // Проверка прав администратора
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!currentUser?.isAdmin) {
      navigate('/')
      return
    }

    // Загрузка данных
    loadNews()
    loadUsers()
    loadLicenseKeys()
  }, [navigate])

  const loadLicenseKeys = () => {
    const savedKeys = JSON.parse(localStorage.getItem('insideLicenseKeys') || '[]')
    setLicenseKeys(savedKeys)
  }

  const generateKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = 4
    const segmentLength = 5
    const keyParts: string[] = []
    
    for (let i = 0; i < segments; i++) {
      let segment = ''
      for (let j = 0; j < segmentLength; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      keyParts.push(segment)
    }
    
    return keyParts.join('-')
  }

  const handleGenerateKeys = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    const newKeys: LicenseKey[] = []
    
    for (let i = 0; i < keyCount; i++) {
      const key: LicenseKey = {
        id: `${Date.now()}-${i}`,
        key: generateKey(),
        product: keyProduct,
        duration: keyDuration,
        createdAt: new Date().toISOString(),
        isUsed: false,
        createdBy: currentUser?.username || 'Admin'
      }
      newKeys.push(key)
    }
    
    const updatedKeys = [...newKeys, ...licenseKeys]
    setLicenseKeys(updatedKeys)
    localStorage.setItem('insideLicenseKeys', JSON.stringify(updatedKeys))
    
    setNotification({ 
      message: `Создано ${keyCount} ${keyCount === 1 ? 'ключ' : keyCount < 5 ? 'ключа' : 'ключей'} для ${getProductName(keyProduct)}`, 
      type: 'success' 
    })
  }

  const handleDeleteKey = (keyId: string) => {
    const updatedKeys = licenseKeys.filter(k => k.id !== keyId)
    setLicenseKeys(updatedKeys)
    localStorage.setItem('insideLicenseKeys', JSON.stringify(updatedKeys))
    setNotification({ message: 'Ключ удален', type: 'info' })
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setNotification({ message: 'Ключ скопирован в буфер обмена', type: 'success' })
  }

  const getProductName = (product: LicenseKey['product']): string => {
    const names: Record<LicenseKey['product'], string> = {
      'premium': 'Premium подписка',
      'alpha': 'Alpha подписка',
      'inside-client': 'Shakedown Client',
      'inside-spoofer': 'Shakedown Spoofer',
      'inside-cleaner': 'Shakedown Cleaner'
    }
    return names[product]
  }

  const getProductColor = (product: LicenseKey['product']): string => {
    const colors: Record<LicenseKey['product'], string> = {
      'premium': 'purple',
      'alpha': 'pink',
      'inside-client': 'blue',
      'inside-spoofer': 'orange',
      'inside-cleaner': 'green'
    }
    return colors[product]
  }

  const loadNews = () => {
    const savedNews = JSON.parse(localStorage.getItem('insideNews') || '[]')
    setNews(savedNews)
  }

  const loadUsers = async () => {
    try {
      // Пробуем загрузить из API
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/users`)
      if (result.ok) {
        const data = await result.json()
        if (data.success && data.data) {
          setUsers(data.data)
          return
        }
      }
    } catch (error) {
      console.error('Failed to load users from API:', error)
    }
    // Fallback на localStorage
    const savedUsers = JSON.parse(localStorage.getItem('insideUsers') || '[]')
    setUsers(savedUsers)
  }

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) {
      setNotification({ message: 'Заполните все поля', type: 'error' })
      return
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    const post: NewsPost = {
      id: Date.now(),
      title: newPost.title,
      content: newPost.content,
      date: new Date().toISOString(),
      author: currentUser?.username || 'Admin',
      type: newPost.type
    }

    const updatedNews = [post, ...news]
    setNews(updatedNews)
    localStorage.setItem('insideNews', JSON.stringify(updatedNews))
    
    console.log('✅ News saved:', post)
    console.log('📰 Total news:', updatedNews.length)
    
    setNewPost({ title: '', content: '', type: 'website' })
    setNotification({ message: `Новость опубликована! (${post.type === 'launcher' ? 'Лаунчер' : 'Сайт'})`, type: 'success' })
    
    // Триггерим событие для обновления
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'insideNews',
      newValue: JSON.stringify(updatedNews),
      url: window.location.href
    }))
  }

  const handleDeletePost = (id: number) => {
    const updatedNews = news.filter(n => n.id !== id)
    setNews(updatedNews)
    localStorage.setItem('insideNews', JSON.stringify(updatedNews))
    setNotification({ message: 'Новость удалена', type: 'info' })
    
    // Триггерим событие для обновления в других компонентах
    window.dispatchEvent(new Event('storage'))
  }

  const handleBanUser = async (userId: number | string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const newBanStatus = !user.isBanned

    // Пробуем обновить через API
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: newBanStatus })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const updatedUsers = users.map(u => u.id === userId ? data.data : u)
          setUsers(updatedUsers)
          setNotification({ 
            message: newBanStatus ? 'Пользователь заблокирован' : 'Пользователь разблокирован', 
            type: 'info' 
          })
          return
        }
      }
    } catch (error) {
      console.error('Ban user error:', error)
    }

    // Fallback на localStorage
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isBanned: newBanStatus } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('insideUsers', JSON.stringify(updatedUsers))
    
    setNotification({ 
      message: newBanStatus ? 'Пользователь заблокирован' : 'Пользователь разблокирован', 
      type: 'info' 
    })
  }

  const handleDeleteUser = (userId: number | string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return
    
    const updatedUsers = users.filter(u => u.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem('insideUsers', JSON.stringify(updatedUsers))
    setNotification({ message: 'Пользователь удален', type: 'info' })
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/')
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/icon.ico" alt="Shakedown" width="32" height="32" />
          <div>
            <h1>Shakedown</h1>
            <span>Админ-панель</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="2" width="7" height="7" rx="1"/>
              <rect x="11" y="2" width="7" height="7" rx="1"/>
              <rect x="2" y="11" width="7" height="7" rx="1"/>
              <rect x="11" y="11" width="7" height="7" rx="1"/>
            </svg>
            <span>Обзор</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4Z"/>
              <rect x="5" y="5" width="6" height="4" fill="#0A0A0F"/>
              <rect x="5" y="11" width="10" height="1" fill="#0A0A0F"/>
              <rect x="5" y="14" width="10" height="1" fill="#0A0A0F"/>
            </svg>
            <span>Новости</span>
            {news.length > 0 && <span className="badge">{news.length}</span>}
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="6" r="4"/>
              <path d="M10 12C5.58172 12 2 14.6863 2 18H18C18 14.6863 14.4183 12 10 12Z"/>
            </svg>
            <span>Пользователи</span>
            {users.length > 0 && <span className="badge">{users.length}</span>}
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10H6L8 4L12 16L14 10H18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Активность</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('keys')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M14.5 2a4.5 4.5 0 00-4.27 5.88L2 16.12V18h1.88l8.24-8.23A4.5 4.5 0 1014.5 2zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
            </svg>
            <span>Ключи</span>
            {licenseKeys.filter(k => !k.isUsed).length > 0 && (
              <span className="badge">{licenseKeys.filter(k => !k.isUsed).length}</span>
            )}
          </button>
        </nav>

        <div className="admin-nav-bottom">
          <button className="admin-nav-item" onClick={() => navigate('/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2L2 7v11h6v-6h4v6h6V7l-8-5z"/>
            </svg>
            <span>Личный кабинет</span>
          </button>
          
          <button className="admin-nav-item" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
            <span>На сайт</span>
          </button>
        </div>

        <button className="btn-logout" onClick={() => setShowLogoutModal(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 3h8v2H5v10h6v2H3V3zm12.5 4.5l3.5 3.5-3.5 3.5-1.4-1.4 1.6-1.6H9v-2h6.7l-1.6-1.6 1.4-1.4z"/>
          </svg>
          <span>Выйти</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeTab === 'overview' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Обзор системы</h2>
              <p>Общая статистика и метрики</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon purple">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="6" r="4"/>
                    <path d="M10 12C5.58172 12 2 14.6863 2 18H18C18 14.6863 14.4183 12 10 12Z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{users.length}</div>
                  <div className="stat-label">Всего пользователей</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon pink">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4Z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{news.length}</div>
                  <div className="stat-label">Опубликовано новостей</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM13.7071 8.70711L9.70711 12.7071C9.31658 13.0976 8.68342 13.0976 8.29289 12.7071L6.29289 10.7071C5.90237 10.3166 5.90237 9.68342 6.29289 9.29289C6.68342 8.90237 7.31658 8.90237 7.70711 9.29289L9 10.5858L12.2929 7.29289C12.6834 6.90237 13.3166 6.90237 13.7071 7.29289C14.0976 7.68342 14.0976 8.31658 13.7071 8.70711Z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{users.filter(u => !u.isBanned).length}</div>
                  <div className="stat-label">Активных пользователей</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z"/>
                  </svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{users.filter(u => u.subscription === 'premium' || u.subscription === 'alpha').length}</div>
                  <div className="stat-label">Премиум подписок</div>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Последние новости</h3>
              <div className="activity-list">
                {news.slice(0, 5).map(post => (
                  <div key={post.id} className="activity-item">
                    <div className="activity-icon">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 4C2 2.89543 2.89543 2 4 2H16C17.1046 2 18 2.89543 18 4V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4Z"/>
                      </svg>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{post.title}</div>
                      <div className="activity-meta">
                        <span className={`news-badge ${post.type}`}>{post.type === 'launcher' ? 'Лаунчер' : 'Сайт'}</span>
                        <span>{new Date(post.date).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {news.length === 0 && (
                  <div className="empty-state">
                    <p>Новостей пока нет</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Управление новостями</h2>
              <p>Создавайте новости для лаунчера и сайта</p>
            </div>

            {/* Create Post Form */}
            <div className="create-post-card">
              <h3>Создать новость</h3>
              <div className="form-group">
                <label>Заголовок</label>
                <input
                  type="text"
                  placeholder="Введите заголовок новости"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Содержание</label>
                <textarea
                  placeholder="Введите текст новости"
                  rows={4}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Тип публикации</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={newPost.type === 'website'}
                      onChange={() => setNewPost({ ...newPost, type: 'website' })}
                    />
                    <span>Сайт</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={newPost.type === 'launcher'}
                      onChange={() => setNewPost({ ...newPost, type: 'launcher' })}
                    />
                    <span>Лаунчер</span>
                  </label>
                </div>
              </div>
              <button className="btn-primary" onClick={handleCreatePost}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Опубликовать
              </button>
            </div>

            {/* News List */}
            <div className="news-list">
              <h3>Опубликованные новости ({news.length})</h3>
              {news.length === 0 ? (
                <div className="empty-state">
                  <p>Новостей пока нет</p>
                </div>
              ) : (
                news.map(post => (
                  <div key={post.id} className="news-card">
                    <div className="news-card-header">
                      <div>
                        <h4>{post.title}</h4>
                        <div className="news-meta">
                          <span className={`news-badge ${post.type}`}>{post.type === 'launcher' ? 'Лаунчер' : 'Сайт'}</span>
                          <span>{new Date(post.date).toLocaleDateString('ru-RU')}</span>
                          <span>Автор: {post.author}</span>
                        </div>
                      </div>
                      <button className="btn-delete" onClick={() => handleDeletePost(post.id)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                      </button>
                    </div>
                    <p>{post.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Активность пользователей</h2>
              <p>Статистика посещений и активности</p>
            </div>

            <div className="activity-stats">
              <div className="activity-chart-card">
                <h3>Посещения за последние 7 дней</h3>
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                      <div key={i} className="chart-bar">
                        <div className="bar-fill" style={{ height: `${height}%` }}></div>
                        <div className="bar-label">{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="activity-info-grid">
                <div className="info-card">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 5C10.5523 5 11 5.44772 11 6V10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10V6C9 5.44772 9.44772 5 10 5ZM10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15Z"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <div className="info-value">1,234</div>
                    <div className="info-label">Всего посещений</div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="10" cy="10" r="8"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <div className="info-value">{users.filter(u => !u.isBanned).length}</div>
                    <div className="info-label">Активных сегодня</div>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z"/>
                    </svg>
                  </div>
                  <div className="info-content">
                    <div className="info-value">87%</div>
                    <div className="info-label">Уровень вовлеченности</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="recent-users">
              <h3>Недавно зарегистрированные</h3>
              <div className="users-list">
                {users.slice(0, 10).map(user => (
                  <div key={user.id} className="user-item">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="user-avatar-small" />
                    ) : (
                      <div className="user-avatar-placeholder-small">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="user-item-info">
                      <div className="user-item-name">{user.username}</div>
                      <div className="user-item-date">{new Date(user.registeredAt).toLocaleDateString('ru-RU')}</div>
                    </div>
                    <span className={`subscription-badge ${user.subscription}`}>
                      {user.subscription === 'premium' ? 'Premium' : 
                       user.subscription === 'alpha' ? 'Alpha' : 'Free'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Управление пользователями</h2>
              <p>Просмотр, блокировка и удаление пользователей</p>
            </div>

            {/* Search */}
            <div className="search-bar">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
              </svg>
              <input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Users Table */}
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Пользователь</th>
                    <th>Email</th>
                    <th>Подписка</th>
                    <th>Дата регистрации</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={user.isBanned ? 'banned' : ''}>
                      <td>#{user.id}</td>
                      <td>
                        <div className="user-cell">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="user-avatar" />
                          ) : (
                            <div className="user-avatar-placeholder">
                              {user.username[0].toUpperCase()}
                            </div>
                          )}
                          <span>{user.username}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`subscription-badge ${user.subscription}`}>
                          {user.subscription === 'premium' ? 'Premium' : 
                           user.subscription === 'alpha' ? 'Alpha' : 'Free'}
                        </span>
                      </td>
                      <td>{new Date(user.registeredAt).toLocaleDateString('ru-RU')}</td>
                      <td>
                        {user.isBanned ? (
                          <span className="status-badge banned">Заблокирован</span>
                        ) : (
                          <span className="status-badge active">Активен</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className={`btn-action ${user.isBanned ? 'unban' : 'ban'}`}
                            onClick={() => handleBanUser(user.id)}
                            title={user.isBanned ? 'Разблокировать' : 'Заблокировать'}
                          >
                            {user.isBanned ? (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM4.5 7.5a.5.5 0 010-1h7a.5.5 0 010 1h-7z"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M11.354 4.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708z"/>
                              </svg>
                            )}
                          </button>
                          <button 
                            className="btn-action delete"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Удалить"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="empty-state">
                  <p>Пользователи не найдены</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Генератор ключей</h2>
              <p>Создание и управление лицензионными ключами для продуктов</p>
            </div>

            {/* Key Generator */}
            <div className="key-generator-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M14.5 2a4.5 4.5 0 00-4.27 5.88L2 16.12V18h1.88l8.24-8.23A4.5 4.5 0 1014.5 2zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
                </svg>
                Создать новые ключи
              </h3>
              
              <div className="generator-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Продукт</label>
                    <select 
                      value={keyProduct} 
                      onChange={(e) => setKeyProduct(e.target.value as LicenseKey['product'])}
                    >
                      <option value="premium">Premium подписка</option>
                      <option value="alpha">Alpha подписка</option>
                      <option value="inside-client">Shakedown Client</option>
                      <option value="inside-spoofer">Shakedown Spoofer</option>
                      <option value="inside-cleaner">Shakedown Cleaner</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Срок действия (дней)</label>
                    <select 
                      value={keyDuration} 
                      onChange={(e) => setKeyDuration(Number(e.target.value))}
                    >
                      <option value={1}>1 день</option>
                      <option value={7}>7 дней</option>
                      <option value={30}>30 дней</option>
                      <option value={90}>90 дней</option>
                      <option value={180}>180 дней</option>
                      <option value={365}>365 дней</option>
                      <option value={0}>Бессрочно</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Количество</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={100} 
                      value={keyCount}
                      onChange={(e) => setKeyCount(Math.min(100, Math.max(1, Number(e.target.value))))}
                    />
                  </div>
                </div>
                
                <button className="btn-primary btn-generate" onClick={handleGenerateKeys}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Сгенерировать {keyCount} {keyCount === 1 ? 'ключ' : keyCount < 5 ? 'ключа' : 'ключей'}
                </button>
              </div>
            </div>

            {/* Keys Stats */}
            <div className="keys-stats">
              <div className="key-stat-card">
                <div className="key-stat-icon total">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M14.5 2a4.5 4.5 0 00-4.27 5.88L2 16.12V18h1.88l8.24-8.23A4.5 4.5 0 1014.5 2z"/>
                  </svg>
                </div>
                <div className="key-stat-info">
                  <div className="key-stat-value">{licenseKeys.length}</div>
                  <div className="key-stat-label">Всего ключей</div>
                </div>
              </div>
              
              <div className="key-stat-card">
                <div className="key-stat-icon available">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                </div>
                <div className="key-stat-info">
                  <div className="key-stat-value">{licenseKeys.filter(k => !k.isUsed).length}</div>
                  <div className="key-stat-label">Доступно</div>
                </div>
              </div>
              
              <div className="key-stat-card">
                <div className="key-stat-icon used">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                  </svg>
                </div>
                <div className="key-stat-info">
                  <div className="key-stat-value">{licenseKeys.filter(k => k.isUsed).length}</div>
                  <div className="key-stat-label">Использовано</div>
                </div>
              </div>
            </div>

            {/* Search Keys */}
            <div className="search-bar">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
              </svg>
              <input
                type="text"
                placeholder="Поиск по ключу или продукту..."
                value={keysSearchQuery}
                onChange={(e) => setKeysSearchQuery(e.target.value)}
              />
            </div>

            {/* Keys List */}
            <div className="keys-list">
              <h3>Созданные ключи ({licenseKeys.length})</h3>
              
              {licenseKeys.length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor" opacity="0.3">
                    <path d="M14.5 2a4.5 4.5 0 00-4.27 5.88L2 16.12V18h1.88l8.24-8.23A4.5 4.5 0 1014.5 2z"/>
                  </svg>
                  <p>Ключи ещё не созданы</p>
                </div>
              ) : (
                <div className="keys-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Ключ</th>
                        <th>Продукт</th>
                        <th>Срок</th>
                        <th>Создан</th>
                        <th>Статус</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {licenseKeys
                        .filter(k => 
                          k.key.toLowerCase().includes(keysSearchQuery.toLowerCase()) ||
                          getProductName(k.product).toLowerCase().includes(keysSearchQuery.toLowerCase())
                        )
                        .map(key => (
                          <tr key={key.id} className={key.isUsed ? 'used' : ''}>
                            <td>
                              <div className="key-cell">
                                <code className="key-code">{key.key}</code>
                                <button 
                                  className="btn-copy" 
                                  onClick={() => handleCopyKey(key.key)}
                                  title="Копировать"
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M4 2a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V2zm2-1a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V2a1 1 0 00-1-1H6zM2 5a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-1h1v1a2 2 0 01-2 2H2a2 2 0 01-2-2V6a2 2 0 012-2h1v1H2z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td>
                              <span className={`product-badge ${getProductColor(key.product)}`}>
                                {getProductName(key.product)}
                              </span>
                            </td>
                            <td>{key.duration === 0 ? 'Бессрочно' : `${key.duration} дн.`}</td>
                            <td>{new Date(key.createdAt).toLocaleDateString('ru-RU')}</td>
                            <td>
                              {key.isUsed ? (
                                <span className="status-badge used">
                                  Использован
                                  {key.usedBy && <small> ({key.usedBy})</small>}
                                </span>
                              ) : (
                                <span className="status-badge available">Доступен</span>
                              )}
                            </td>
                            <td>
                              <button 
                                className="btn-action delete"
                                onClick={() => handleDeleteKey(key.id)}
                                title="Удалить"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
