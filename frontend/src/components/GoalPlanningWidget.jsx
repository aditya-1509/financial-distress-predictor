import { useState } from 'react'
import { Target, Plus, X, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

const GoalPlanningWidget = ({ householdData }) => {
    const [showModal, setShowModal] = useState(false)
    const [goals, setGoals] = useState([])
    const [goalForm, setGoalForm] = useState({
        goal_name: '',
        goal_amount: '',
        duration_months: '',
        priority: 'Medium'
    })
    const [analysis, setAnalysis] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleInputChange = (field, value) => {
        setGoalForm(prev => ({ ...prev, [field]: value }))
    }

    const analyzeGoal = async () => {
        if (!goalForm.goal_name || !goalForm.goal_amount || !goalForm.duration_months) {
            alert('Please fill all fields')
            return
        }

        setIsAnalyzing(true)

        try {
            const response = await fetch('/analyze_goal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...householdData,
                    goal: {
                        goal_name: goalForm.goal_name,
                        goal_amount: parseFloat(goalForm.goal_amount),
                        duration_months: parseInt(goalForm.duration_months),
                        priority: goalForm.priority
                    }
                })
            })

            if (!response.ok) throw new Error('Goal analysis failed')

            const result = await response.json()
            setAnalysis(result)
        } catch (error) {
            console.error('Goal analysis error:', error)
            alert('Could not analyze goal. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const addGoal = () => {
        if (!analysis) return

        setGoals(prev => [...prev, {
            ...goalForm,
            analysis
        }])

        setGoalForm({ goal_name: '', goal_amount: '', duration_months: '', priority: 'Medium' })
        setAnalysis(null)
        setShowModal(false)
    }

    const removeGoal = (index) => {
        setGoals(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Target className="w-5 h-5 text-purple-400 mr-3" />
                    <div>
                        <h3 className="text-lg font-bold font-mono text-white">FINANCIAL GOALS</h3>
                        <p className="text-xs text-gray-400 font-mono">Plan & track your objectives</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded border border-purple-500/30 transition-colors text-sm font-mono"
                >
                    <Plus className="w-4 h-4" />
                    <span>ADD GOAL</span>
                </button>
            </div>

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="text-center text-gray-500 font-mono text-sm py-8">
                    No goals yet. Add one to start planning!
                </div>
            ) : (
                <div className="space-y-3">
                    {goals.map((goal, index) => (
                        <div key={index} className="bg-black/40 p-4 rounded border border-white/5 flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-mono text-white font-bold">{goal.goal_name}</h4>
                                    <span className={`text-xs px-2 py-1 rounded font-mono ${goal.analysis.feasibility === 'Achievable' ? 'bg-green-950 text-green-400' :
                                        goal.analysis.feasibility === 'Tight' ? 'bg-yellow-950 text-yellow-400' :
                                            'bg-red-950 text-red-400'
                                        }`}>
                                        {goal.analysis.feasibility}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 font-mono space-x-4">
                                    <span>Target: ${parseFloat(goal.goal_amount).toLocaleString()}</span>
                                    <span>Duration: {goal.duration_months} months</span>
                                    <span>Required: ${goal.analysis.required_monthly.toFixed(0)}/mo</span>
                                </div>
                            </div>
                            <button
                                onClick={() => removeGoal(index)}
                                className="text-gray-600 hover:text-red-400 transition-colors ml-4"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-white/20 rounded-lg max-w-2xl w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold font-mono text-white">Add Financial Goal</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-2">Goal Name</label>
                                <input
                                    type="text"
                                    value={goalForm.goal_name}
                                    onChange={(e) => handleInputChange('goal_name', e.target.value)}
                                    placeholder="e.g., Emergency Fund, House Down Payment"
                                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-white font-mono text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-2">Target Amount ($)</label>
                                    <input
                                        type="number"
                                        value={goalForm.goal_amount}
                                        onChange={(e) => handleInputChange('goal_amount', e.target.value)}
                                        placeholder="10000"
                                        className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-white font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-2">Duration (months)</label>
                                    <input
                                        type="number"
                                        value={goalForm.duration_months}
                                        onChange={(e) => handleInputChange('duration_months', e.target.value)}
                                        placeholder="12"
                                        className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-white font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={analyzeGoal}
                            disabled={isAnalyzing}
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-mono font-bold py-3 rounded transition-colors disabled:opacity-50 mb-4"
                        >
                            {isAnalyzing ? 'ANALYZING...' : 'ANALYZE FEASIBILITY'}
                        </button>

                        {/* Analysis Results */}
                        {analysis && (
                            <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
                                <div className="flex items-center space-x-3 mb-3">
                                    {analysis.feasibility === 'Achievable' ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : analysis.feasibility === 'Tight' ? (
                                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                    )}
                                    <span className={`font-mono font-bold ${analysis.feasibility === 'Achievable' ? 'text-green-400' :
                                        analysis.feasibility === 'Tight' ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {analysis.feasibility}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3 text-sm font-mono">
                                    <div>
                                        <div className="text-gray-500 text-xs">Required Monthly</div>
                                        <div className="text-white">${analysis.required_monthly.toFixed(0)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">Available Surplus</div>
                                        <div className="text-white">${analysis.available_surplus.toFixed(0)}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">Gap</div>
                                        <div className={analysis.gap > 0 ? 'text-red-400' : 'text-green-400'}>
                                            ${Math.abs(analysis.gap).toFixed(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs">Distress Impact</div>
                                        <div className="text-orange-400">+{analysis.distress_impact_pct.toFixed(1)}%</div>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 space-y-1">
                                    {analysis.suggestions.map((suggestion, i) => (
                                        <div key={i}>• {suggestion}</div>
                                    ))}
                                </div>

                                <button
                                    onClick={addGoal}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-mono py-2 rounded transition-colors mt-4"
                                >
                                    ADD TO GOALS
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default GoalPlanningWidget
