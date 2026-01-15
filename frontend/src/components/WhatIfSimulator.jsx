import { useState, useCallback, useEffect } from 'react'
import { Sliders, RefreshCcw, Loader, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'
import _ from 'lodash'

const WhatIfSimulator = ({ originalData, currentScore, currentHealthBreakdown, onSimulationUpdate }) => {
    const [simulatedData, setSimulatedData] = useState(originalData)
    const [simulatedResult, setSimulatedResult] = useState(null)
    const [isSimulating, setIsSimulating] = useState(false)
    const [delta, setDelta] = useState(0)
    const [componentDeltas, setComponentDeltas] = useState({})

    const runSimulation = useCallback(_.debounce(async (newData) => {
        setIsSimulating(true)

        try {
            const API_URL = import.meta.env.VITE_API_URL || ''
            const response = await fetch(`${API_URL}/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            })

            if (!response.ok) throw new Error('Simulation failed')

            const result = await response.json()
            setSimulatedResult(result)

            const scoreDelta = result.health_score - currentScore
            setDelta(scoreDelta)

            const compDeltas = {
                income_stability: (result.health_breakdown?.income_stability || 0) - (currentHealthBreakdown?.income_stability || 0),
                expense_control: (result.health_breakdown?.expense_control || 0) - (currentHealthBreakdown?.expense_control || 0),
                debt_pressure: (result.health_breakdown?.debt_pressure || 0) - (currentHealthBreakdown?.debt_pressure || 0),
                savings_discipline: (result.health_breakdown?.savings_discipline || 0) - (currentHealthBreakdown?.savings_discipline || 0)
            }
            setComponentDeltas(compDeltas)

        } catch (error) {
            console.error('Simulation error:', error)
        } finally {
            setIsSimulating(false)
        }
    }, 500),
        [currentScore, currentHealthBreakdown]
    )

    const handleSliderChange = (field, value) => {
        const newValue = parseFloat(value)
        const newData = { ...simulatedData, [field]: newValue }
        setSimulatedData(newData)
        runSimulation(newData)
    }

    const handleReset = () => {
        setSimulatedData(originalData)
        setSimulatedResult(null)
        setDelta(0)
        setComponentDeltas({})
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

    const monthlySurplus = (simulatedData.Net_Income || 0) - (
        (simulatedData.Food || 0) + (simulatedData.Housing || 0) + (simulatedData.Transport || 0) +
        (simulatedData.Health || 0) + (simulatedData.Education || 0) + (simulatedData.Recreation || 0) +
        (simulatedData.Clothing || 0) + (simulatedData.Communication || 0) + (simulatedData.Restaurants || 0) +
        (simulatedData.Miscellaneous || 0)
    )

    const originalSurplus = (originalData.Net_Income || 0) - (
        (originalData.Food || 0) + (originalData.Housing || 0) + (originalData.Transport || 0) +
        (originalData.Health || 0) + (originalData.Education || 0) + (originalData.Recreation || 0) +
        (originalData.Clothing || 0) + (originalData.Communication || 0) + (originalData.Restaurants || 0) +
        (originalData.Miscellaneous || 0)
    )

    const surplusDelta = monthlySurplus - originalSurplus

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-900/30 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center">
                    <div className="bg-cyan-500/20 p-2 rounded-lg mr-3">
                        <Sliders className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold font-mono text-white tracking-wide">WHAT-IF SIMULATOR</h3>
                        <p className="text-xs text-gray-400 font-mono">Real-time outcome prediction</p>
                    </div>
                </div>
            </div>

            {/* Immediate Impact Panel */}
            <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                <div className="bg-black/40 p-3 rounded border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 font-mono">Monthly Surplus</span>
                        <Activity className="w-3 h-3 text-blue-400" />
                    </div>
                    <div className="text-lg font-bold text-white font-mono">{formatCurrency(monthlySurplus)}</div>
                    {surplusDelta !== 0 && (
                        <div className={`text-xs font-mono mt-1 ${surplusDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {surplusDelta > 0 ? '↑' : '↓'} {formatCurrency(Math.abs(surplusDelta))}
                        </div>
                    )}
                </div>

                <div className="bg-black/40 p-3 rounded border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 font-mono">Health Score</span>
                        <Zap className="w-3 h-3 text-yellow-400" />
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                        {isSimulating ? (
                            <Loader className="w-5 h-5 animate-spin inline" />
                        ) : (
                            simulatedResult?.health_score?.toFixed(1) || currentScore.toFixed(1)
                        )}
                    </div>
                    {delta !== 0 && !isSimulating && (
                        <div className={`text-xs font-mono mt-1 ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
                        </div>
                    )}
                </div>

                <div className="bg-black/40 p-3 rounded border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 font-mono">Trajectory</span>
                        {delta > 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-gray-500" />}
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                        {delta > 5 ? 'Improving' : delta < -5 ? 'Worsening' : 'Stable'}
                    </div>
                </div>
            </div>

            {/* Component Deltas */}
            {Object.keys(componentDeltas).length > 0 && !isSimulating && (
                <div className="mb-6 bg-black/20 p-4 rounded border border-white/5">
                    <h4 className="text-xs font-mono text-gray-400 uppercase mb-3">Component Changes</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(componentDeltas).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                                <span className="text-gray-400 font-mono capitalize">{key.replace('_', ' ')}</span>
                                <span className={`font-mono font-bold ${value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                    {value > 0 && '+'}{value.toFixed(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sliders Control Panel */}
            <div className="space-y-6 relative z-10 mb-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">

                {/* Income Section */}
                <div>
                    <h4 className="text-xs font-mono text-emerald-400 uppercase mb-3 border-b border-white/5 pb-1">Income Stream</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                                <span>Net Income</span>
                                <span className="text-white">{formatCurrency(simulatedData.Net_Income)}</span>
                            </div>
                            <input
                                type="range"
                                min={originalData.Net_Income * 0.5}
                                max={originalData.Net_Income * 1.5}
                                step={100}
                                value={simulatedData.Net_Income}
                                onChange={(e) => handleSliderChange('Net_Income', e.target.value)}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Essentials Section */}
                <div>
                    <h4 className="text-xs font-mono text-blue-400 uppercase mb-3 border-b border-white/5 pb-1">Essentials</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                                <span>Housing</span>
                                <span className="text-white">{formatCurrency(simulatedData.Housing)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={simulatedData.Net_Income * 0.8}
                                step={50}
                                value={simulatedData.Housing}
                                onChange={(e) => handleSliderChange('Housing', e.target.value)}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                                <span>Food & Groceries</span>
                                <span className="text-white">{formatCurrency(simulatedData.Food)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={simulatedData.Net_Income * 0.4}
                                step={50}
                                value={simulatedData.Food}
                                onChange={(e) => handleSliderChange('Food', e.target.value)}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                                <span>Transport</span>
                                <span className="text-white">{formatCurrency(simulatedData.Transport)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={simulatedData.Net_Income * 0.3}
                                step={50}
                                value={simulatedData.Transport}
                                onChange={(e) => handleSliderChange('Transport', e.target.value)}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Lifestyle Section */}
                <div>
                    <h4 className="text-xs font-mono text-pink-400 uppercase mb-3 border-b border-white/5 pb-1">Lifestyle Choice</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                                <span>Dining Out</span>
                                <span className="text-white">{formatCurrency(simulatedData.Restaurants)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={simulatedData.Net_Income * 0.3}
                                step={50}
                                value={simulatedData.Restaurants}
                                onChange={(e) => handleSliderChange('Restaurants', e.target.value)}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                                <span>Recreation & Fun</span>
                                <span className="text-white">{formatCurrency(simulatedData.Recreation)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={simulatedData.Net_Income * 0.3}
                                step={50}
                                value={simulatedData.Recreation}
                                onChange={(e) => handleSliderChange('Recreation', e.target.value)}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                                <span>Shopping/Clothing</span>
                                <span className="text-white">{formatCurrency(simulatedData.Clothing)}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={simulatedData.Net_Income * 0.3}
                                step={50}
                                value={simulatedData.Clothing}
                                onChange={(e) => handleSliderChange('Clothing', e.target.value)}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <button
                    onClick={handleReset}
                    className="flex items-center text-xs text-gray-500 hover:text-white transition-colors font-mono"
                >
                    <RefreshCcw className="w-3 h-3 mr-2" />
                    RESET
                </button>
            </div>
        </div>
    )
}

export default WhatIfSimulator
