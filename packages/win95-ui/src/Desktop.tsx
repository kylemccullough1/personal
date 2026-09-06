import type { CSSProperties, ReactNode } from 'react'

export function Desktop({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      data-dg="desktop"
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--dg-desktop-bg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
