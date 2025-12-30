import { useState } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing' or 'dashboard'
  const [predictionData, setPredictionData] = useState(null)

  const handleStartAnalysis = () => {
    setCurrentView('dashboard')
  }

  const handleBackToHome = () => {
    setCurrentView('landing')
    setPredictionData(null)
  }

  return (
    <div className="min-h-screen">
      {currentView === 'landing' ? (
        <LandingPage onStartAnalysis={handleStartAnalysis} />
      ) : (
        <Dashboard
          onBackToHome={handleBackToHome}
          predictionData={predictionData}
          setPredictionData={setPredictionData}
        />
      )}
    </div>
  )
}

export default App
