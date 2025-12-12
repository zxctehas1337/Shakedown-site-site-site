import { useState, useEffect } from 'react'
import '../styles/ThemeLanguageSelector.css'
import { LANGUAGES } from '../utils/constants'

interface LanguageSelectorProps {
  onLanguageChange?: (lang: string) => void
  dropdownDirection?: 'up' | 'down'
}

function LanguageSelector({ onLanguageChange, dropdownDirection = 'down' }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState('ru')
  const [showLangMenu, setShowLangMenu] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ru'
    setCurrentLang(savedLang)
  }, [])

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang)
    localStorage.setItem('language', lang)
    setShowLangMenu(false)
    onLanguageChange?.(lang)
  }

  return (
    <div className="language-selector">
      <button 
        className="lang-toggle"
        onClick={() => setShowLangMenu(!showLangMenu)}
      >
        <span className="lang-flag">{LANGUAGES[currentLang as keyof typeof LANGUAGES].flag}</span>
        <span className="lang-code">{currentLang.toUpperCase()}</span>
      </button>

      {showLangMenu && (
        <div className={`lang-menu ${dropdownDirection === 'up' ? 'lang-menu-up' : 'lang-menu-down'}`}>
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              className={`lang-option ${currentLang === code ? 'active' : ''}`}
              onClick={() => changeLanguage(code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
