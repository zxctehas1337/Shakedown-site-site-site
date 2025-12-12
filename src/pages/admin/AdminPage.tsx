import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NewsPost, LicenseKey } from '../../types'
import Notification from '../../components/Notification'
import { LogoutModal } from '../../components/LogoutModal'
import { useAdminData } from './hooks/useAdminData'
import { 
  AdminSidebar, 
  OverviewTab, 
  NewsTab, 
  UsersTab, 
  ActivityTab, 
  KeysTab 
} from './components'
import { getProductName } from './utils/keyUtils'
import '../../styles/admin/index.css'

type TabType = 'overview' | 'news' | 'users' | 'activity' | 'keys'

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  const { news, setNews, users, setUsers, licenseKeys, setLicenseKeys } = useAdminData()

  const handleCreatePost = (newPost: { title: string; content: string; type: 'launcher' | 'website' }) => {
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
    setNotification({ message: `Новость опубликована! (${post.type === 'launcher' ? 'Лаунчер' : 'Сайт'})`, type: 'success' })

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
    window.dispatchEvent(new Event('storage'))
  }

  const handleBanUser = async (userId: number | string) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    const newBanStatus = !user.isBanned

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

  const handleGenerateKeys = (newKeys: LicenseKey[]) => {
    const updatedKeys = [...newKeys, ...licenseKeys]
    setLicenseKeys(updatedKeys)
    localStorage.setItem('insideLicenseKeys', JSON.stringify(updatedKeys))
    
    const keyCount = newKeys.length
    setNotification({ 
      message: `Создано ${keyCount} ${keyCount === 1 ? 'ключ' : keyCount < 5 ? 'ключа' : 'ключей'} для ${getProductName(newKeys[0].product)}`, 
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

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/')
  }

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

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        newsCount={news.length}
        usersCount={users.length}
        availableKeysCount={licenseKeys.filter(k => !k.isUsed).length}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      <main className="admin-main">
        {activeTab === 'overview' && (
          <OverviewTab users={users} news={news} />
        )}

        {activeTab === 'news' && (
          <NewsTab 
            news={news} 
            onCreatePost={handleCreatePost} 
            onDeletePost={handleDeletePost} 
          />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users} 
            onBanUser={handleBanUser} 
            onDeleteUser={handleDeleteUser} 
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab users={users} />
        )}

        {activeTab === 'keys' && (
          <KeysTab 
            licenseKeys={licenseKeys}
            onGenerateKeys={handleGenerateKeys}
            onDeleteKey={handleDeleteKey}
            onCopyKey={handleCopyKey}
          />
        )}
      </main>
    </div>
  )
}
