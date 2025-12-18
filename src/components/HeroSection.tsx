import { useNavigate } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useIsMobile } from '../hooks/useIsMobile'
import { CLIENT_INFO, SOCIAL_LINKS } from '../utils/constants'
import { getTranslation, Language } from '../utils/translations'
import { IconArrowRight, IconDiscord, IconTelegram } from './Icons'

interface HeroSectionProps {
  lang: Language
}

export default function HeroSection({ lang }: HeroSectionProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
  const t = getTranslation(lang)

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main 
      ref={ref}
      data-animate="hero"
      className={`hero-section ${isVisible ? 'visible' : ''}`}
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

      <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>
        <h1 className="hero-title animate-item delay-1">
          <span className="gradient-text-animated">{CLIENT_INFO.name}</span>
        </h1>
        <p className="hero-subtitle animate-item delay-2">
          {t.hero.subtitle}
        </p>
        <div className="hero-buttons animate-item delay-3">
          <button onClick={() => navigate('/auth')} className="primary-button">
            <span>{t.hero.cta}</span>
            <IconArrowRight />
          </button>
          <button onClick={scrollToFeatures} className="secondary-button">
            {t.hero.learnMore}
          </button>
        </div>
        
        {/* Социальные сети */}
        <div className="social-links animate-item delay-4">
          {SOCIAL_LINKS.discord && (
            <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer" className="social-link hover-lift">
              <IconDiscord />
            </a>
          )}
          {SOCIAL_LINKS.telegram && (
            <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="social-link hover-lift">
              <IconTelegram />
            </a>
          )}
        </div>
      </div>
    </main>
  )
}
