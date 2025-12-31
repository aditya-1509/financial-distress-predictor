import { useState } from 'react'
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react'
import InputForm from './InputForm'
import ResultsDisplay from './ResultsDisplay'

const Dashboard = ({ onBackToHome, predictionData, setPredictionData }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (formData) => {
        setLoading(true)
        setError(null)

        try {
            const API_URL = import.meta.env.VITE_API_URL || ''
            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || 'Prediction request failed')
            }

            const data = await response.json()
            setPredictionData(data)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.')
            console.error('Prediction error:', err)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setPredictionData(null)
        setError(null)
    }

    return (
        <div className="min-h-screen bg-black text-white py-8 relative overflow-hidden">
            {/* Background elements to match landing page */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full stars-bg opacity-30"></div>
                <div className="absolute top-0 -left-10 w-40 h-full border-r border-cyan-500/10"></div>
                <div className="absolute top-0 right-10 w-40 h-full border-l border-cyan-500/10"></div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <button
                        onClick={onBackToHome}
                        className="flex items-center space-x-2 text-cyan-400 hover:text-white transition-colors group font-mono text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="tracking-wider">BACK TO HOME</span>
                    </button>

                    <h1 className="text-2xl font-bold text-white font-mono tracking-wide">
                        FINANCIAL<span className="text-cyan-400">HEALTH</span> DASHBOARD
                    </h1>

                    {predictionData && (
                        <button
                            onClick={handleReset}
                            className="bg-white/10 hover:bg-cyan-400 hover:text-black text-white text-xs font-mono px-4 py-2 border border-white/20 hover:border-cyan-400 transition-all duration-300"
                        >
                            NEW ANALYSIS
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-400 p-4 flex items-start space-x-3 font-mono text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold mb-1">SYSTEM WARNING</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {!predictionData ? (
                    <InputForm onSubmit={handleSubmit} loading={loading} />
                ) : (
                    <ResultsDisplay data={predictionData} onReset={handleReset} />
                )}
            </div>
        </div>
    )
}

export default Dashboard
