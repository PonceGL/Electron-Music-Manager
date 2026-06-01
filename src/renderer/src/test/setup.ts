import '@testing-library/jest-dom'

Object.defineProperty(window, 'electronAPI', {
  value: { platform: 'darwin' },
  writable: true
})
