import { CLIENT_INFO, SOCIAL_LINKS } from '../utils/constants'
import { getTranslation, Language } from '../utils/translations'

interface FooterProps {
  lang: Language
}

export default function Footer({ lang }: FooterProps) {
  const t = getTranslation(lang)

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img
            src="/icon.ico"
            alt="Shakedown"
            className="footer-logo no-user-drag"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
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
  )
}
