import { useEffect } from 'react'
import './App.css'
import { useNavigate } from 'react-router-dom'

function App() {
  const router = useNavigate()
  useEffect(() => {router('/dashboard')})

  return (
    <div>Landing Page</div>
  )
}

export default App
