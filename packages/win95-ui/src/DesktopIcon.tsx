import type { ComponentType } from 'react'

export type IconVariant = '32x32_4' | '16x16_4'
type IconComponent = ComponentType<{ variant?: IconVariant }>

export function DesktopIcon({
  icon: Icon,
  label,
  onOpen,
  onPrewarm,
}: {
  icon: IconComponent
  label: string
  onOpen?: () => void
  /** Fired on hover and mousedown so a project container can wake before the double-click lands. */
  onPrewarm?: () => void
}) {
  return (
    <button
      type="button"
      data-dg="desktop-icon"
      onDoubleClick={onOpen}
      onMouseEnter={onPrewarm}
      onMouseDown={onPrewarm}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        width: 76,
        padding: 4,
        background: 'transparent',
        border: 'none',
        cursor: 'default',
        color: 'white',
        textShadow: '1px 1px 0 #000',
        fontFamily: 'inherit',
        fontSize: 11,
      }}
    >
      <Icon variant="32x32_4" />
      <span>{label}</span>
    </button>
  )
}
