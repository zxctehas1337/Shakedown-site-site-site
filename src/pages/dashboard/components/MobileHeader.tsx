import { CLIENT_INFO } from '../../../utils/constants'

interface Props {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function MobileHeader({ mobileMenuOpen, setMobileMenuOpen }: Props) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-left">
        <img
          src="/icon.ico"
          alt="Shakedown"
          className="mobile-logo no-user-drag"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        <span className="mobile-brand">{CLIENT_INFO.name}</span>
      </div>
      <button 
        className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  )
}
