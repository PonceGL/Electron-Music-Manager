import { Button } from '@poncegl/material-design-3'

const isMac = window.electronAPI.platform === 'darwin'

function App(): React.JSX.Element {
  const handleClick = (name: string) => {
    console.log(`Button ${name} clicked`)
  }
  return (
    <div className="fw-full flex h-screen flex-col">
      {/* h-8 = 32px, matches titleBarOverlay.height on Windows and macOS hiddenInset bar */}
      {isMac && <div data-testid="drag-region" className="h-8 shrink-0 app-drag" />}
      <main className="flex flex-1 flex-col items-center justify-center">
        <h1 className="mb-2 text-[2.5rem] font-bold text-accent">Music Manager</h1>
        <p className="text-base text-muted">Your music, organized.</p>
        <section className="flex flex-1 items-center justify-center gap-2">
          <Button onClick={() => handleClick('Filled')} variant="filled">
            Filled
          </Button>
          <Button onClick={() => handleClick('Elevated')} variant="elevated">
            Elevated
          </Button>
          <Button onClick={() => handleClick('Filled Tonal')} variant="filled-tonal">
            Filled Tonal
          </Button>
          <Button onClick={() => handleClick('Outlined')} variant="outlined">
            Outlined
          </Button>
          <Button onClick={() => handleClick('Text')} variant="text">
            Text
          </Button>
          <Button onClick={() => handleClick('Disabled')} disabled>
            Disabled
          </Button>
        </section>
      </main>
    </div>
  )
}

export default App
