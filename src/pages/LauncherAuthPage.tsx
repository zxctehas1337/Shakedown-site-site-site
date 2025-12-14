import { useEffect } from 'react'
import { getCurrentUser } from '../utils/database'

export default function LauncherAuthPage() {
    useEffect(() => {
        // Небольшая задержка чтобы убедиться что localStorage инициализирован
        const checkAuth = setTimeout(() => {
            const user = getCurrentUser()

            if (user) {
                console.log('User found, redirecting to launcher...', user)
                // Кодируем данные пользователя для передачи в лаунчер
                const userData = encodeURIComponent(JSON.stringify(user))

                // Получаем порт из параметров URL
                const urlParams = new URLSearchParams(window.location.search)
                const port = urlParams.get('port') || 3000

                // Редиректим на локальный сервер лаунчера
                window.location.href = `http://127.0.0.1:${port}/callback?user=${userData}`
            } else {
                console.log('User not found, redirecting to login...')
                // Если не авторизован, редиректим на страницу входа
                // Добавляем параметр чтобы после входа можно было вернуться (опционально)
                window.location.href = '/auth?redirect=launcher'
            }
        }, 500)

        return () => clearTimeout(checkAuth)
    }, [])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#0a0a0f',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                padding: '30px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(138, 75, 255, 0.3)',
                    borderTopColor: '#8A4BFF',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                }} />
                <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Проверка авторизации...</h2>
                <p style={{ margin: 0, opacity: 0.6 }}>Пожалуйста, подождите</p>
            </div>
            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    )
}
