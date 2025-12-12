import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground.tsx'
import LanguageSelector from '../components/ThemeLanguageSelector.tsx'
import '../styles/home/index.css'
import '../styles/animations.css'
import { CLIENT_INFO, SOCIAL_LINKS, fetchProducts, PRODUCTS_FALLBACK, Product } from '../utils/constants.ts'
import { getTranslation, getCurrentLanguage, Language } from '../utils/translations/index.ts'

function PricingPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const [products, setProducts] = useState<Product[]>(PRODUCTS_FALLBACK)
  const t = getTranslation(lang)

  // Загрузка продуктов с API
  useEffect(() => {
    fetchProducts().then(data => {
      if (data.length > 0) {
        setProducts(data)
      }
    })
  }, [])

  const productsRef = useRef<HTMLDivElement>(null)
  const [productsVisible, setProductsVisible] = useState(false)

  // Слушаем изменение языка
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

  // Intersection Observer для анимаций
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setProductsVisible(true)
        }
      })
    }, observerOptions)

    if (productsRef.current) observer.observe(productsRef.current)

    // Сразу показываем
    setTimeout(() => setProductsVisible(true), 100)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="home-page">
      <AnimatedBackground />
      
      {/* Декоративные элементы */}
      <div className="deco-orb deco-orb-1"></div>
      <div className="deco-orb deco-orb-2"></div>
      <div className="deco-orb deco-orb-3"></div>
      
      {/* Навигация */}
      <nav className="navbar">
        <div className="nav-brand">
          <img src="/icon.ico" alt="Shakedown Logo" className="nav-logo" />
          <div className="brand-info">
            <span className="brand-name">{CLIENT_INFO.name}</span>
          </div>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/')} className="nav-link">{t.nav.home}</button>
          <button onClick={() => navigate('/news')} className="nav-link">{t.nav.news}</button>
          <LanguageSelector 
            onLanguageChange={() => {
              setLang(getCurrentLanguage())
            }}
          />
          <button onClick={() => navigate('/auth')} className="nav-button-login">{t.nav.dashboard}</button>
        </div>
      </nav>

      {/* Секция цен */}
      <section 
        id="services" 
        className={`services-section ${productsVisible ? 'visible' : ''}`}
        style={{ paddingTop: '120px' }}
      >
        <h2 className={`section-title animate-fade-up ${productsVisible ? 'visible' : ''}`}>
          {t.services.title}
        </h2>
        <div 
          ref={productsRef}
          data-animate="products"
          className="products-grid"
        >
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className={`product-card hover-lift ${product.popular ? 'popular' : ''} animate-fade-up ${productsVisible ? 'visible' : ''}`}
              style={{transitionDelay: `${0.1 * index}s`}}
            >
              {product.popular && <div className="popular-badge">{t.services.popular}</div>}
              {'discount' in product && (product as { discount?: number }).discount && (
                <div className="discount-badge">{t.services.discount} {(product as { discount?: number }).discount}%</div>
              )}
              
              <div className="product-header">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
              </div>

              <div className="product-price">
                {'originalPrice' in product && (product as { originalPrice?: number }).originalPrice && (
                  <span className="original-price">{(product as { originalPrice?: number }).originalPrice} ₽</span>
                )}
                <span className="current-price">{product.price} ₽</span>
              </div>

              <ul className="product-features">
                {product.features.map((feature, idx) => (
                  <li key={idx}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate('/auth')} 
                className="product-button glow-button"
              >
                {t.services.pay}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/icon.ico" alt="Shakedown" className="footer-logo" />
            <span className="footer-name gradient-text">{CLIENT_INFO.name}</span>
          </div>
          <div className="footer-links">
            <a href="/">{t.nav.home}</a>
            <a href="/news">{t.nav.news}</a>
            <a href="/auth">{t.nav.dashboard}</a>
          </div>
          <div className="footer-social">
            {SOCIAL_LINKS.discord && (
              <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer">Discord</a>
            )}
            {SOCIAL_LINKS.telegram && (
              <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 {CLIENT_INFO.name}. {t.footer.rights}</p>
        </div>
      </footer>
    </div>
  )
}

export default PricingPage
