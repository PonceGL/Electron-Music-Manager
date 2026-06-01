import './App.css'

const isMac = window.electronAPI.platform === 'darwin'

function App(): React.JSX.Element {
  return (
    <div className="app">
      {isMac && <div className="drag-region" />}
      <main className="content">
        <h1>Music Manager</h1>
        <p>Your music, organized.</p>
      </main>
    </div>
  )
}

export default App
