export interface User {
  id: number | string
  username: string
  email: string
  password: string
  subscription: 'free' | 'premium' | 'alpha'
  registeredAt: string
  avatar?: string
  settings: UserSettings
  isAdmin?: boolean
  isBanned?: boolean
  emailVerified?: boolean
}

export interface UserSettings {
  notifications: boolean
  autoUpdate: boolean
  theme: 'dark' | 'light' | 'auto'
  language: 'ru' | 'en' | 'uk'
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface NewsPost {
  id: number
  title: string
  content: string
  date: string
  author: string
  type: 'launcher' | 'website'
}

export interface LicenseKey {
  id: string
  key: string
  product: 'premium' | 'alpha' | 'inside-client' | 'inside-spoofer' | 'inside-cleaner'
  duration: number // в днях, 0 = бессрочно
  createdAt: string
  usedAt?: string
  usedBy?: string | number
  isUsed: boolean
  createdBy: string
}
