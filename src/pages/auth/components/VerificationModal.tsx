import * as React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyEmailCode, resendVerificationCode } from '../../../utils/api'
import { Database, setCurrentUser } from '../../../utils/database'
import { NotificationType } from '../../../types'

interface VerificationModalProps {
  pendingUserId: string | null
  setNotification: (notification: { message: string; type: NotificationType } | null) => void
  onClose: () => void
}

export function VerificationModal({ pendingUserId, setNotification, onClose }: VerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const navigate = useNavigate()

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerificationCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyCode = async () => {
    const code = verificationCode.join('')
    if (code.length !== 6) {
      setNotification({ message: 'Введите полный код', type: 'error' })
      return
    }

    if (!pendingUserId) {
      setNotification({ message: 'Ошибка: ID пользователя не найден', type: 'error' })
      return
    }

    setIsVerifying(true)
    const result = await verifyEmailCode(pendingUserId, code)
    setIsVerifying(false)

    if (result.success) {
      setNotification({ message: result.message, type: 'success' })
      onClose()
      
      const db = new Database()
      const userResult = await db.getUserById(pendingUserId)
      if (userResult.success && userResult.user) {
        setCurrentUser(userResult.user)
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } else {
      setNotification({ message: result.message, type: 'error' })
    }
  }

  const handleResendCode = async () => {
    if (!pendingUserId) return

    const result = await resendVerificationCode(pendingUserId)
    if (result.success) {
      setNotification({ message: result.message, type: 'success' })
      setVerificationCode(['', '', '', '', '', ''])
    } else {
      setNotification({ message: result.message, type: 'error' })
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Подтверждение Email</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          <p className="verification-text">
            Мы отправили 6-значный код на вашу почту. Введите его ниже:
          </p>
          
          <div className="code-inputs">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleVerificationCodeKeyDown(index, e)}
                className="code-input"
              />
            ))}
          </div>

          <button 
            className="btn btn-primary btn-full"
            onClick={handleVerifyCode}
            disabled={isVerifying || verificationCode.join('').length !== 6}
          >
            {isVerifying ? 'Проверка...' : 'Подтвердить'}
          </button>

          <button 
            className="btn btn-secondary btn-full"
            onClick={handleResendCode}
            disabled={isVerifying}
          >
            Отправить код повторно
          </button>
        </div>
      </div>
    </div>
  )
}
