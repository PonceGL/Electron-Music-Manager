import '@poncegl/material-design-3/styles.css'
import { Button } from '@poncegl/material-design-3'

export function TestMD3(): React.JSX.Element {
  const handleClick = () => {
    alert('Button clicked')
  }
  return <Button onClick={handleClick}>Test MD3 Button</Button>
}
