import { TestMD3 } from './TestMD3'

const isMac = window.electronAPI.platform === 'darwin'

function App(): React.JSX.Element {
  return (
    <div className="flex h-screen flex-col">
      {/* h-8 = 32px, matches titleBarOverlay.height on Windows and macOS hiddenInset bar */}
      {isMac && <div data-testid="drag-region" className="h-8 shrink-0 app-drag" />}
      <main className="flex flex-1 flex-col items-center justify-center">
        <h1 className="mb-2 text-[2.5rem] font-bold text-accent">Music Manager</h1>
        <p className="text-base text-muted">Your music, organized.</p>
        <TestMD3 />
      </main>
    </div>
  )
}

export default App
