import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, setCurrentUser } from '../../../utils/database'
import { User, NotificationType, LicenseKey, UserProfile } from '../../../types'
import { useTranslation } from '../../../hooks/useTranslation'

export type TabType = 'overview' | 'profile' | 'subscription' | 'settings'

export function useDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showSoonModal, setShowSoonModal] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [profileForm, setProfileForm] = useState<UserProfile>({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { t, dateLocale } = useTranslation()

  useEffect(() => {
    const userData = getCurrentUser()
    if (!userData) {
      navigate('/auth')
    } else {
      setUser(userData)
      setProfileForm(userData.profile || {})
    }
  }, [navigate])

  const handleLogout = () => {
    setCurrentUser(null)
    navigate('/auth')
  }

  const handleBuyClient = () => {
    setShowSoonModal(true)
  }

  const handleActivateKey = () => {
    if (!keyInput.trim()) {
      setNotification({ message: t.dashboard.enterKeyToActivate, type: 'error' })
      return
    }

    const licenseKeys: LicenseKey[] = JSON.parse(localStorage.getItem('insideLicenseKeys') || '[]')
    const keyIndex = licenseKeys.findIndex(k => k.key === keyInput.trim().toUpperCase())
    
    if (keyIndex === -1) {
      setNotification({ message: t.dashboard.keyNotFound, type: 'error' })
      return
    }

    const licenseKey = licenseKeys[keyIndex]

    if (licenseKey.isUsed) {
      setNotification({ message: t.dashboard.keyAlreadyUsed, type: 'error' })
      return
    }

    licenseKeys[keyIndex] = {
      ...licenseKey,
      isUsed: true,
      usedAt: new Date().toISOString(),
      usedBy: user?.id
    }

    localStorage.setItem('insideLicenseKeys', JSON.stringify(licenseKeys))

    if (user) {
      let newSubscription: 'free' | 'premium' | 'alpha' = user.subscription
      
      if (licenseKey.product === 'premium' || licenseKey.product === 'inside-client') {
        newSubscription = 'premium'
      } else if (licenseKey.product === 'alpha') {
        newSubscription = 'alpha'
      }

      const updatedUser = { ...user, subscription: newSubscription }
      setCurrentUser(updatedUser)
      setUser(updatedUser)

      const users: User[] = JSON.parse(localStorage.getItem('insideUsers') || '[]')
      const userIndex = users.findIndex(u => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem('insideUsers', JSON.stringify(users))
      }
    }

    const productNames: Record<string, string> = {
      'premium': 'Premium',
      'alpha': 'Alpha',
      'inside-client': 'Shakedown Client',
      'inside-spoofer': 'Shakedown Spoofer',
      'inside-cleaner': 'Shakedown Cleaner'
    }

    const durationText = licenseKey.duration === 0 
      ? t.dashboard.forever 
      : t.dashboard.forDays.replace('{days}', String(licenseKey.duration))
    setNotification({ message: `${t.dashboard.keyActivated} ${productNames[licenseKey.product]} ${durationText}`, type: 'success' })
    setKeyInput('')
  }

  const handleDownloadLauncher = () => {
    setShowSoonModal(true)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      setNotification({ message: t.dashboard.fileTooLarge, type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      if (user) {
        const updatedUser = { ...user, avatar: base64 }
        updateUserData(updatedUser)
        setNotification({ message: t.dashboard.avatarUpdated, type: 'success' })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleProfileSave = () => {
    if (!user) return

    if (profileForm.displayName && profileForm.displayName.trim()) {
      const users: User[] = JSON.parse(localStorage.getItem('insideUsers') || '[]')
      const nameTaken = users.some(u => 
        u.id !== user.id && 
        (u.profile?.displayName?.toLowerCase() === profileForm.displayName?.toLowerCase() ||
         u.username.toLowerCase() === profileForm.displayName?.toLowerCase())
      )
      if (nameTaken) {
        setNotification({ message: t.dashboard.nameTaken, type: 'error' })
        return
      }
    }

    const updatedUser = { ...user, profile: { displayName: profileForm.displayName } }
    updateUserData(updatedUser)
    setNotification({ message: t.dashboard.profileSaved, type: 'success' })
  }

  const updateUserData = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    setUser(updatedUser)

    const users: User[] = JSON.parse(localStorage.getItem('insideUsers') || '[]')
    const userIndex = users.findIndex(u => u.id === updatedUser.id)
    if (userIndex !== -1) {
      users[userIndex] = updatedUser
      localStorage.setItem('insideUsers', JSON.stringify(users))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'alpha': return { text: 'Alpha', class: 'badge-alpha' }
      case 'premium': return { text: 'Premium', class: 'badge-premium' }
      default: return { text: 'Free', class: 'badge-free' }
    }
  }

  return {
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
    navigate,
    t,
    handleLogout,
    handleBuyClient,
    handleActivateKey,
    handleDownloadLauncher,
    handleAvatarChange,
    handleProfileSave,
    formatDate,
    getSubscriptionBadge
  }
}
