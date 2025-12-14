import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
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

  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus()
    inputRefs.current[index]?.select()
  }

  const applyDigitsFrom = (startIndex: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return

    const newCode = [...verificationCode]
    let idx = startIndex
    for (const d of digits) {
      if (idx > 5) break
      newCode[idx] = d
      idx += 1
    }
    setVerificationCode(newCode)

    if (idx <= 5) focusIndex(idx)
    else focusIndex(5)
  }

  const handleVerificationCodeChange = (index: number, rawValue: string) => {
    if (!rawValue) {
      const newCode = [...verificationCode]
      newCode[index] = ''
      setVerificationCode(newCode)
      return
    }

    const digits = rawValue.replace(/\D/g, '')
    if (!digits) return

    if (digits.length === 1) {
      const newCode = [...verificationCode]
      newCode[index] = digits
      setVerificationCode(newCode)

      if (index < 5) focusIndex(index + 1)
      return
    }

    applyDigitsFrom(index, digits)
  }

  const handleVerificationCodePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    applyDigitsFrom(index, e.clipboardData.getData('text'))
  }

  const handleVerificationCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      focusIndex(index - 1)
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusIndex(index - 1)
    }

    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      focusIndex(index + 1)
    }
  }

  const handleVerifyCode = async () => {
    const code = verificationCode.join('')
    if (code.length !== 6) {
      setNotification({ message: 'Введите код', type: 'error' })
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
          <h2>Подтвердите email</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          <p className="verification-text">
            Введите 6-значный код из письма.
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
                onPaste={(e) => handleVerificationCodePaste(index, e)}
                onFocus={() => inputRefs.current[index]?.select()}
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                className="code-input"
              />
            ))}
          </div>

          <p className="verification-hint">Можно вставить код целиком (Ctrl+V).</p>

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
