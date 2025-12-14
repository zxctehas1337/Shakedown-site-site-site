import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground.tsx'
import LanguageSelector from '../components/ThemeLanguageSelector.tsx'
import Footer from '../components/Footer.tsx'
import LogoWithHat from '../components/LogoWithHat'
import { IconHome, IconNews, IconUser, IconShoppingBag } from '../components/Icons'
import '../styles/home/index.css'
import '../styles/PricingPage.css'
import { CLIENT_INFO, fetchProducts, PRODUCTS_FALLBACK, Product } from '../utils/constants.ts'
import { getTranslation, getCurrentLanguage, Language } from '../utils/translations/index.ts'

function PricingPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const [products, setProducts] = useState<Product[]>(PRODUCTS_FALLBACK)
  const t = getTranslation(lang)

  useEffect(() => {
    fetchProducts().then(data => {
      if (data.length > 0) {
        setProducts(data)
      }
    })
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      setLang(getCurrentLanguage())
    }
    window.addEventListener('storage', handleStorageChange)
    
    const interval = setInterval(() => {
      const newLang = getCurrentLanguage()
      if (newLang !== lang) {
        setLang(newLang)
      }
    }, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [lang])

  // Функция для получения изображения продукта с учетом языка
  const getProductImage = (product: Product): string => {
    const name = product.name.toLowerCase()
    const isRussian = lang === 'ru'
    const suffix = isRussian ? '.jpg' : '-eng.jpg'
    
    if (name.includes('alpha')) return `/alpha.jpg`
    if (name.includes('premium')) return `/premium30days${suffix}`
    if (name.includes('30')) return `/30days${suffix}`
    if (name.includes('90')) return `/90days${suffix}`
    if (name.includes('навсегда') || name.includes('forever') || name.includes('lifetime')) return `/forever${suffix}`
    if (name.includes('hwid') || name.includes('сброс')) return `/remove${suffix}`
    return '/photo.png' // fallback изображение
  }

  return (
    <div className="home-page pricing-page">
      <AnimatedBackground />
      
      <div className="deco-orb deco-orb-1"></div>
      <div className="deco-orb deco-orb-2"></div>
      <div className="deco-orb deco-orb-3"></div>
      
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <div className="nav-logo-container">
            <LogoWithHat
              alt="Shakedown Logo"
              size={42}
              className="nav-logo no-user-drag"
              hatClassName="nav-logo-hat"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
          <div className="brand-info">
            <span className="brand-name">{CLIENT_INFO.name}</span>
          </div>
        </Link>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-link"><IconHome />{t.nav.home}</button>
          <button onClick={() => navigate('/news')} className="nav-link"><IconNews />{t.nav.news}</button>
          <LanguageSelector 
            onLanguageChange={() => {
              setLang(getCurrentLanguage())
            }}
          />
          <button onClick={() => navigate('/auth')} className="nav-button-login"><IconUser />{t.nav.dashboard}</button>
        </div>
      </nav>

      <section className="pricing-section">
        <h2 className="pricing-title">{t.services.title}</h2>
        
        <div className="pricing-grid">
          {products.map((product) => {
            const hasDiscount = 'discount' in product && (product as { discount?: number }).discount
            const originalPrice = 'originalPrice' in product ? (product as { originalPrice?: number }).originalPrice : null
            
            return (
              <div key={product.id} className="pricing-card">
                <div className="pricing-card-image">
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name}
                    className="pricing-card-img"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
                
                <div className="pricing-card-content">
                  <h3 className="pricing-card-name">{product.name}</h3>
                  
                  <div className="pricing-card-price">
                    <span className="pricing-card-price-label">Цена:</span>
                    {originalPrice && (
                      <span className="pricing-card-price-original">{originalPrice} ₽</span>
                    )}
                    <span className="pricing-card-price-current">{product.price} ₽</span>
                    {hasDiscount && (
                      <span className="pricing-discount-badge">
                        Скидка {(product as { discount?: number }).discount}%
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => navigate('/auth')} 
                    className="pricing-card-button"
                  >
                    <IconShoppingBag />
                    {t.services.pay}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  )
}

export default PricingPage
