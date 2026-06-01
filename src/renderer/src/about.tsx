import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './about.css'

interface AppInfo {
  name: string
  version: string
  description: string
}

function About(): React.JSX.Element {
  const [info, setInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    window.electronAPI.getAppInfo().then(setInfo).catch(console.error)
  }, [])

  return (
    <div className="about">
      <h1>{info?.name ?? 'Music Manager'}</h1>
      {info && <p className="version">Version {info.version}</p>}
      {info && <p className="description">{info.description}</p>}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <About />
  </React.StrictMode>
)
