import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ControlPanel, DisplayScreen } from './components'
import { useDriveThru } from './hooks'

export default function App() {
  const app = useDriveThru()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DisplayScreen app={app} />} />
        <Route path="/panel" element={<ControlPanel app={app} />} />
        <Route path="*" element={<DisplayScreen app={app} />} />
      </Routes>
    </BrowserRouter>
  )
}
