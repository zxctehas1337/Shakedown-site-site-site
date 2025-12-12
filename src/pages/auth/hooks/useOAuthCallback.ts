import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setCurrentUser } from '../../../utils/database'
import { NotificationType } from '../../../types'

interface UseOAuthCallbackProps {
  setNotification: (notification: { message: string; type: NotificationType } | null) => void
}

export function useOAuthCallback({ setNotification }: UseOAuthCallbackProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authStatus = params.get('auth')
    const userData = params.get('user')
    const error = params.get('error')

    if (error) {
      const errorMessages: Record<string, string> = {
        'google_failed': 'Ошибка входа через Google',
        'yandex_failed': 'Ошибка входа через Yandex',
        'github_failed': 'Ошибка входа через GitHub'
      }
      setNotification({ message: errorMessages[error] || 'Ошибка авторизации', type: 'error' })
      window.history.replaceState({}, document.title, '/auth')
      return
    }

    if (authStatus === 'success' && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData))
        console.log('✅ OAuth успешен, сохраняем пользователя с токеном')
        setCurrentUser(user)
        setNotification({ message: 'Вход выполнен успешно!', type: 'success' })
        
        window.history.replaceState({}, document.title, '/auth')

        if (user.isAdmin) {
          setTimeout(() => navigate('/admin'), 1500)
        } else {
          setTimeout(() => navigate('/dashboard'), 1500)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        setNotification({ message: 'Ошибка при входе', type: 'error' })
      }
    }
  }, [navigate, setNotification])
}
