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
    window.electronAPI.getAppInfo().then(setInfo)
  }, [])

  if (!info) return <div className="about" />

  return (
    <div className="about">
      <h1>{info.name}</h1>
      <p className="version">Version {info.version}</p>
      <p className="description">{info.description}</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <About />
  </React.StrictMode>
)
