import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Music Manager' })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<App />)
    expect(screen.getByText('Your music, organized.')).toBeInTheDocument()
  })

  it('shows the drag region on macOS', () => {
    // window.electronAPI.platform is mocked to 'darwin' in test/setup.ts
    const { container } = render(<App />)
    expect(container.querySelector('.drag-region')).toBeInTheDocument()
  })
})
