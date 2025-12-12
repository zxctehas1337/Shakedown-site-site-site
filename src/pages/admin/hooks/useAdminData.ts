import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, NewsPost, LicenseKey } from '../../../types'

export function useAdminData() {
  const navigate = useNavigate()
  const [news, setNews] = useState<NewsPost[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [licenseKeys, setLicenseKeys] = useState<LicenseKey[]>([])

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
    if (!currentUser?.isAdmin) {
      navigate('/')
      return
    }

    loadNews()
    loadUsers()
    loadLicenseKeys()
  }, [navigate])

  const loadNews = () => {
    const savedNews = JSON.parse(localStorage.getItem('insideNews') || '[]')
    setNews(savedNews)
  }

  const loadUsers = async () => {
    try {
      const result = await fetch(`/api/users`)
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
    const savedUsers = JSON.parse(localStorage.getItem('insideUsers') || '[]')
    setUsers(savedUsers)
  }

  const loadLicenseKeys = () => {
    const savedKeys = JSON.parse(localStorage.getItem('insideLicenseKeys') || '[]')
    setLicenseKeys(savedKeys)
  }

  return {
    news,
    setNews,
    users,
    setUsers,
    licenseKeys,
    setLicenseKeys,
    loadNews,
    loadUsers,
    loadLicenseKeys
  }
}
