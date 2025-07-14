import './App.css'
import TestSocketConnection from './components/TestSocketConnection'
import { SocketProvider } from './contexts/SocketContext'

function App() {

  return (
    <SocketProvider>
      <div>
        <h1>Hello World!</h1>
        <TestSocketConnection />
      </div>
    </SocketProvider>
  )
}

export default App
