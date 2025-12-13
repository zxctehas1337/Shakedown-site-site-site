import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground.tsx'
import LanguageSelector from '../components/ThemeLanguageSelector.tsx'
import '../styles/home/index.css'
import '../styles/animations.css'
import { CLIENT_INFO, SOCIAL_LINKS } from '../utils/constants.ts'
import { getTranslation, getCurrentLanguage, Language } from '../utils/translations/index.ts'

// Hook для определения мобильного устройства
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

function HomePage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Language>(getCurrentLanguage())
  const t = getTranslation(lang)
  const isMobile = useIsMobile()

  // Refs для анимаций при скролле
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  // Состояния видимости
  const [heroVisible, setHeroVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)

  // Слушаем изменение языка
  useEffect(() => {
    const handleStorageChange = () => {
      setLang(getCurrentLanguage())
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Проверяем каждые 100ms для изменений в том же окне
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
          const id = entry.target.getAttribute('data-animate')
          switch(id) {
            case 'hero': setHeroVisible(true); break
            case 'features': setFeaturesVisible(true); break
          }
        }
      })
    }, observerOptions)

    // Наблюдаем за элементами
    if (heroRef.current) observer.observe(heroRef.current)
    if (featuresRef.current) observer.observe(featuresRef.current)

    // Hero сразу видим
    setTimeout(() => setHeroVisible(true), 100)

    return () => observer.disconnect()
  }, [])

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }



  return (
    <div className="home-page">
      <AnimatedBackground />
      
      {/* Декоративные элементы */}
      <div className="deco-orb deco-orb-1"></div>
      <div className="deco-orb deco-orb-2"></div>
      <div className="deco-orb deco-orb-3"></div>
      
      {/* Навигация */}
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <img src="/icon.ico" alt="Shakedown Logo" className="nav-logo" />
          <div className="brand-info">
            <span className="brand-name">{CLIENT_INFO.name}</span>
          </div>
        </Link>
        <div className="nav-links">
          <button onClick={() => navigate('/pricing')} className="nav-link">{t.nav.services}</button>
          <button onClick={() => navigate('/news')} className="nav-link">{t.nav.news}</button>
          <LanguageSelector 
            onLanguageChange={() => {
              // Обновляем язык при изменении
              setLang(getCurrentLanguage())
            }}
          />
          <button onClick={() => navigate('/auth')} className="nav-button-login">{t.nav.dashboard}</button>
        </div>
      </nav>

      {/* Hero секция */}
      <main 
        ref={heroRef as React.RefObject<HTMLElement>}
        data-animate="hero"
        className={`hero-section ${heroVisible ? 'visible' : ''}`}
      >
        {/* Фоновое изображение */}
        <div className="hero-background">
          <img 
            src={isMobile ? "/photo2.png" : "/photo.png"} 
            alt="" 
            className="hero-bg-image" 
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="hero-bg-overlay"></div>
        </div>

        <div className={`hero-content ${heroVisible ? 'animate-in' : ''}`}>
          <h1 className="hero-title animate-item delay-1">
            <span className="gradient-text-animated">{CLIENT_INFO.name}</span>
          </h1>
          <p className="hero-subtitle animate-item delay-2">
            {t.hero.subtitle}
          </p>
          <div className="hero-buttons animate-item delay-3">
            <button onClick={() => navigate('/auth')} className="primary-button glow-button">
              <span>{t.hero.cta}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={scrollToFeatures} className="secondary-button">
              {t.hero.learnMore}
            </button>
          </div>
          
          {/* Социальные сети */}
          <div className="social-links animate-item delay-4">
            {SOCIAL_LINKS.discord && (
              <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className="social-link hover-lift">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            )}
            {SOCIAL_LINKS.telegram && (
              <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="social-link hover-lift">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19c-.14.75-.42 1-.68 1.03c-.58.05-1.02-.38-1.58-.75c-.88-.58-1.38-.94-2.23-1.5c-.99-.65-.35-1.01.22-1.59c.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02c-.09.02-1.49.95-4.22 2.79c-.4.27-.76.41-1.08.4c-.36-.01-1.04-.2-1.55-.37c-.63-.2-1.12-.31-1.08-.66c.02-.18.27-.36.74-.55c2.92-1.27 4.86-2.11 5.83-2.51c2.78-1.16 3.35-1.36 3.73-1.36c.08 0 .27.02.39.12c.1.08.13.19.14.27c-.01.06.01.24 0 .38z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Преимущества */}
      <section 
        id="features" 
        ref={featuresRef}
        data-animate="features"
        className={`features-section ${featuresVisible ? 'visible' : ''}`}
      >
        <div className="features-layout">
          {/* Левая колонка с заголовком и одной карточкой */}
          <div className={`features-left animate-fade-up ${featuresVisible ? 'visible' : ''}`}>
            <div className="features-header">
              <h2 className="features-title">{t.features.ourAdvantages}</h2>
              <p className="features-subtitle">{t.features.ourAdvantagesDesc}</p>
            </div>
            <div className="feature-card feature-card-left">
              <div className="feature-card-header">
                <span className="feature-card-icon">
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M26 4L14 24H24L22 44L34 24H24L26 4Z" fill="currentColor" />
                  </svg>
                </span>
                <h4 className="feature-card-title">{t.features.optimization}</h4>
              </div>
              <p className="feature-card-desc">{t.features.optimizationDesc}</p>
            </div>
          </div>
          
          {/* Правая колонка с карточками 2x2 */}
          <div className="features-grid">
            {[
              { 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="8" width="36" height="26" rx="2" />
                    <path d="M6 30H42" />
                    <path d="M18 40H30" strokeLinecap="round" />
                    <path d="M24 34V40" />
                  </svg>
                ),
                title: t.features.interface, 
                desc: t.features.interfaceDescFull 
              },
              { 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="10" y="10" width="28" height="4" rx="1" fill="currentColor" />
                    <rect x="10" y="18" width="28" height="4" rx="1" fill="currentColor" />
                    <rect x="10" y="26" width="28" height="4" rx="1" fill="currentColor" />
                    <rect x="10" y="34" width="20" height="4" rx="1" fill="currentColor" />
                  </svg>
                ),
                title: t.features.customization, 
                desc: t.features.customizationDesc 
              },
              { 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="24" cy="24" r="18" />
                    <path d="M24 10V24L32 32" strokeLinecap="round" />
                  </svg>
                ),
                title: t.features.updates, 
                desc: t.features.updatesDescFull 
              },
              { 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="24" cy="16" r="8" fill="currentColor" />
                    <path d="M10 42C10 33.163 16.268 26 24 26C31.732 26 38 33.163 38 42" fill="currentColor" />
                  </svg>
                ),
                title: t.features.support, 
                desc: t.features.supportDescFull 
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`feature-card animate-fade-up ${featuresVisible ? 'visible' : ''}`}
                style={{transitionDelay: `${0.1 * (index + 1)}s`}}
              >
                <div className="feature-card-header">
                  <span className="feature-card-icon">{feature.icon}</span>
                  <h4 className="feature-card-title">{feature.title}</h4>
                </div>
                <p className="feature-card-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
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
            <a href="/pricing">{t.nav.services}</a>
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

export default HomePage
