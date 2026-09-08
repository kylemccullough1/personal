import { SnapPreview } from './SnapPreview'
import { WindowFrame } from './WindowFrame'
import { useWindowManager } from './WindowManager'

/** Renders every open window plus the snap preview. Drop it inside <Desktop>. */
export function WindowLayer() {
  const { windows } = useWindowManager()
  return (
    <>
      {windows.map((win) => (
        <WindowFrame key={win.id} win={win} />
      ))}
      <SnapPreview />
    </>
  )
}
