import { useState, useEffect } from 'react'
import '../styles/PaymentModal.css'
import { PRODUCTS } from '../utils/constants'
import { getTranslation, getCurrentLanguage, Language } from '../utils/translations/index'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  productId?: string
}

function PaymentModal({ isOpen, onClose, productId }: PaymentModalProps) {
  const [selectedProduct, setSelectedProduct] = useState(productId || '')
  const [promoCode, setPromoCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'youkassa' | 'funpay' | ''>('')
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const t = getTranslation(lang)

  useEffect(() => {
    const interval = setInterval(() => {
      const newLang = getCurrentLanguage()
      if (newLang !== lang) setLang(newLang)
    }, 100)
    return () => clearInterval(interval)
  }, [lang])

  if (!isOpen) return null

  const product = PRODUCTS.find(p => p.id === selectedProduct)
  const finalPrice = product?.price || 0

  const handlePayment = () => {
    if (!selectedProduct || !paymentMethod) {
      alert('Выберите товар и способ оплаты')
      return
    }

    if (paymentMethod === 'youkassa') {
      alert('Перенаправление на оплату через ЮKassa...')
    } else if (paymentMethod === 'funpay') {
      alert('Перенаправление на FunPay...')
    }
  }

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <h2 className="modal-title">{t.payment.title}</h2>

        {/* Выбор товара */}
        <div className="modal-section">
          <label className="modal-label">{t.payment.selectProduct}</label>
          <select 
            className="modal-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">{t.payment.selectPlaceholder}</option>
            {PRODUCTS.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.price} ₽
                {'discount' in p && (p as { discount?: number }).discount && ` (${t.services.discount} ${(p as { discount?: number }).discount}%)`}
              </option>
            ))}
          </select>
        </div>

        {/* Промокод */}
        <div className="modal-section">
          <label className="modal-label">{t.payment.promo}</label>
          <input
            type="text"
            className="modal-input"
            placeholder={t.payment.promoPlaceholder}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
        </div>

        {/* Итоговая цена */}
        {product && (
          <div className="price-summary">
            <div className="price-row">
              <span>{t.payment.toPay}:</span>
              <span className="price-amount">
                {'originalPrice' in product && (product as { originalPrice?: number }).originalPrice && (
                  <span className="price-original">{(product as { originalPrice?: number }).originalPrice} ₽</span>
                )}
                <span className="price-final">{finalPrice} ₽</span>
                {'discount' in product && (product as { discount?: number }).discount && (
                  <span className="price-discount">{t.services.discount} {(product as { discount?: number }).discount}%</span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Способы оплаты */}
        <div className="modal-section">
          <label className="modal-label">{t.payment.paymentMethod}</label>
          <div className="payment-methods">
            <button
              className={`payment-method ${paymentMethod === 'youkassa' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('youkassa')}
            >
              <div className="payment-icon">💳</div>
              <div className="payment-info">
                <div className="payment-name">ЮKassa</div>
                <div className="payment-desc">{t.payment.cards}</div>
              </div>
            </button>

            <button
              className={`payment-method ${paymentMethod === 'funpay' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('funpay')}
            >
              <div className="payment-icon">🎮</div>
              <div className="payment-info">
                <div className="payment-name">FunPay</div>
                <div className="payment-desc">{t.payment.gameMarket}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Кнопка оплаты */}
        <button 
          className="payment-button"
          onClick={handlePayment}
          disabled={!selectedProduct || !paymentMethod}
        >
          {t.payment.continue}
        </button>

        <div className="payment-note">
          {t.payment.note}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
