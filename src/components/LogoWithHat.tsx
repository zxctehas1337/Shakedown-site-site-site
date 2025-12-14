import type { DragEventHandler, MouseEventHandler } from 'react'
import '../styles/LogoWithHat.css'

interface LogoWithHatProps {
  src?: string
  alt: string
  size: number
  className?: string
  hatClassName?: string
  draggable?: boolean
  onContextMenu?: MouseEventHandler
  onDragStart?: DragEventHandler
}

export default function LogoWithHat({
  src = '/icon.ico',
  alt,
  size,
  className,
  hatClassName,
  draggable = false,
  onContextMenu,
  onDragStart
}: LogoWithHatProps) {
  const logoClassName = ['logoWithHat__logo', className].filter(Boolean).join(' ')

  return (
    <span className="logoWithHat">
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={logoClassName}
        draggable={draggable}
        onContextMenu={onContextMenu}
        onDragStart={onDragStart}
      />
      <img
        src="/hat.png"
        alt="New Year Hat"
        className={hatClassName || 'logoWithHat__hat'}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </span>
  )
}
