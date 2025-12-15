import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, NewsPost, LicenseKey } from '../../../types'
import { getLicenseKeys, createLicenseKeys, deleteLicenseKey } from '../../../utils/keys'

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

  const loadLicenseKeys = async () => {
    try {
      const result = await getLicenseKeys()
      if (result.success && result.data) {
        setLicenseKeys(result.data)
        return
      }
    } catch (error) {
      console.error('Failed to load keys from API:', error)
    }
    // Fallback to localStorage
    const savedKeys = JSON.parse(localStorage.getItem('insideLicenseKeys') || '[]')
    setLicenseKeys(savedKeys)
  }

  const createKeys = async (newKeys: LicenseKey[]) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
      const keysWithCreator = newKeys.map(key => ({
        ...key,
        createdBy: currentUser?.id
      }))
      
      const result = await createLicenseKeys(keysWithCreator)
      if (result.success) {
        await loadLicenseKeys()
        return result
      }
    } catch (error) {
      console.error('Failed to create keys via API:', error)
    }
    
    // Fallback to localStorage
    const updatedKeys = [...newKeys, ...licenseKeys]
    setLicenseKeys(updatedKeys)
    localStorage.setItem('insideLicenseKeys', JSON.stringify(updatedKeys))
    return { success: true, data: updatedKeys }
  }

  const deleteKey = async (keyId: string) => {
    try {
      const result = await deleteLicenseKey(keyId)
      if (result.success) {
        await loadLicenseKeys()
        return result
      }
    } catch (error) {
      console.error('Failed to delete key via API:', error)
    }
    
    // Fallback to localStorage
    const updatedKeys = licenseKeys.filter(k => k.id !== keyId)
    setLicenseKeys(updatedKeys)
    localStorage.setItem('insideLicenseKeys', JSON.stringify(updatedKeys))
    return { success: true, message: 'Ключ удален' }
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
    loadLicenseKeys,
    createKeys,
    deleteKey
  }
}
