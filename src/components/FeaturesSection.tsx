import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { getTranslation, Language } from '../utils/translations'

interface FeaturesSectionProps {
  lang: Language
}

export default function FeaturesSection({ lang }: FeaturesSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
  const t = getTranslation(lang)

  const features = [
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M26 4L14 24H24L22 44L34 24H24L26 4Z" fill="currentColor" />
        </svg>
      ),
      title: t.features.optimization, 
      desc: t.features.optimizationDesc 
    },
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
    },
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="6" width="32" height="36" rx="2" />
          <path d="M16 14H32" />
          <path d="M16 22H32" />
          <path d="M16 30H28" />
          <circle cx="34" cy="38" r="8" fill="currentColor" stroke="none" />
          <path d="M31 38L33 40L37 36" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      ),
      title: t.features.richFunctionality, 
      desc: t.features.richFunctionalityDesc 
    },
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="22" width="28" height="20" rx="3" fill="currentColor" />
          <path d="M16 22V14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14V22" fill="none" />
          <circle cx="24" cy="32" r="3" fill="var(--bg-primary)" />
          <path d="M24 35V38" stroke="var(--bg-primary)" strokeWidth="2" />
        </svg>
      ),
      title: t.features.security, 
      desc: t.features.securityDesc 
    },
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="14" r="6" fill="currentColor" />
          <circle cx="12" cy="20" r="5" fill="currentColor" />
          <circle cx="36" cy="20" r="5" fill="currentColor" />
          <path d="M8 38C8 32 11 28 16 28C18 28 20 29 22 30" />
          <path d="M40 38C40 32 37 28 32 28C30 28 28 29 26 30" />
          <path d="M14 42C14 34 18 30 24 30C30 30 34 34 34 42" />
        </svg>
      ),
      title: t.features.community, 
      desc: t.features.communityDesc 
    }
  ]

  return (
    <section 
      id="features" 
      ref={ref}
      data-animate="features"
      className={`features-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="features-container">
        <div className={`features-header animate-fade-up ${isVisible ? 'visible' : ''}`}>
          <h2 className="features-title">{t.features.ourAdvantages}</h2>
          <p className="features-subtitle">{t.features.ourAdvantagesDesc}</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`feature-card animate-fade-up ${isVisible ? 'visible' : ''}`}
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
  )
}
