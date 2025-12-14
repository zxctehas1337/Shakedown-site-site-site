import * as React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, setCurrentUser } from '../../../utils/database'
import { NotificationType } from '../../../types'

interface EmailRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  setNotification: (notification: { message: string; type: NotificationType } | null) => void
  onRequiresVerification: (userId: string) => void
}

export function EmailRegisterModal({
  isOpen,
  onClose,
  setNotification,
  onRequiresVerification,
}: EmailRegisterModalProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !email || !password) {
      setNotification({ message: 'Заполните все поля', type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      const db = new Database()
      const result = await db.register(username, email, password)

      if (result.success && result.user) {
        if ((result as any).requiresVerification) {
          setNotification({ message: result.message || 'Код подтверждения отправлен на email', type: 'success' })
          onClose()
          onRequiresVerification(String(result.user.id))
          return
        }

        setCurrentUser(result.user)
        setNotification({ message: result.message || 'Регистрация успешна!', type: 'success' })
        onClose()

        setTimeout(() => {
          if (result.user?.isAdmin) {
            navigate('/admin')
          } else {
            navigate('/dashboard')
          }
        }, 600)
      } else {
        setNotification({ message: result.message || 'Ошибка регистрации', type: 'error' })
      }
    } catch (error) {
      console.error('Email registration error:', error)
      setNotification({ message: 'Ошибка подключения к серверу', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setUsername('')
      setEmail('')
      setPassword('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content email-login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Регистрация через Email</h3>
          <button className="modal-close" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleRegister} className="admin-form-clean">
          <div className="form-group-clean">
            <label htmlFor="username-register-modal">Логин</label>
            <input
              id="username-register-modal"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="input-clean"
              required
            />
          </div>

          <div className="form-group-clean">
            <label htmlFor="email-register-modal">Email</label>
            <input
              id="email-register-modal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-clean"
              required
            />
          </div>

          <div className="form-group-clean">
            <label htmlFor="password-register-modal">Пароль</label>
            <input
              id="password-register-modal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-clean"
              required
            />
          </div>

          <button type="submit" className="btn-primary-clean" disabled={isLoading}>
            {isLoading ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  )
}
