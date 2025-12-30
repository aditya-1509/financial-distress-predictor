import { Gauge, Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const HealthScoreWithBreakdown = ({ score, breakdown }) => {
    let zone = 'Resilient'
    let zoneColor = 'text-green-500'
    let message = 'Excellent financial health'

    if (score < 40) {
        zone = 'Distressed'
        zoneColor = 'text-red-500'
        message = 'Urgent action required'
    } else if (score < 50) {
        zone = 'Fragile'
        zoneColor = 'text-orange-500'
        message = 'High vulnerability'
    } else if (score < 70) {
        zone = 'Stable'
        zoneColor = 'text-yellow-500'
        message = 'Room for improvement'
    } else if (score < 85) {
        zone = 'Strong'
        zoneColor = 'text-cyan-500'
        message = 'Good financial position'
    }

    const markerPosition = score

    return (
        <div className="space-y-6">
            {/* Main Score Display */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Activity className="w-32 h-32" />
                </div>

                <h3 className="text-sm font-mono text-gray-400 mb-2 uppercase tracking-widest flex items-center justify-center">
                    <Gauge className="w-4 h-4 mr-2" />
                    Financial Health Score
                </h3>

                <div className={`text-6xl font-bold font-mono ${zoneColor} mb-2`}>
                    {score.toFixed(1)}
                </div>

                <div className={`text-sm font-mono uppercase tracking-widest ${zoneColor} mb-1`}>
                    {zone}
                </div>

                <p className="text-xs text-gray-500">{message}</p>
            </div>

            {/* Combined Grid: Health Spectrum + Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Zone Mapping Bar - spans 2 columns on large screens */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-lg p-6">
                    <h4 className="text-xs font-mono text-gray-400 uppercase mb-4 tracking-wider">Health Spectrum</h4>

                    {/* Bar */}
                    <div className="relative h-12 bg-gradient-to-r from-red-900/40 via-yellow-900/40 via-cyan-900/40 to-green-900/40 rounded-lg overflow-hidden mb-2">
                        {/* Zone markers - using absolute positioning to cover full width */}
                        <div className="absolute inset-0">
                            <div className="absolute top-0 bottom-0 border-r border-white/10" style={{ left: '20%' }}></div>
                            <div className="absolute top-0 bottom-0 border-r border-white/10" style={{ left: '40%' }}></div>
                            <div className="absolute top-0 bottom-0 border-r border-white/10" style={{ left: '60%' }}></div>
                            <div className="absolute top-0 bottom-0 border-r border-white/10" style={{ left: '80%' }}></div>
                        </div>

                        {/* Position Marker */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500"
                            style={{ left: `${markerPosition}%` }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <div className="bg-white text-black text-xs font-mono font-bold px-2 py-1 rounded shadow-lg">
                                    You
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="flex justify-between text-[10px] font-mono text-gray-600 uppercase">
                        <span>0</span>
                        <span>30</span>
                        <span>50</span>
                        <span>70</span>
                        <span>85</span>
                        <span>100</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-gray-700 mt-1">
                        <span>Distress</span>
                        <span>Fragile</span>
                        <span>Stable</span>
                        <span>Strong</span>
                        <span className="text-right">Resilient</span>
                    </div>
                </div>
                {/* Income Stability */}
                <BreakdownCard
                    title="Income Stability"
                    score={breakdown?.income_stability || 0}
                    icon={<TrendingUp className="w-4 h-4" />}
                    description="Savings capacity"
                />

                {/* Expense Control */}
                <BreakdownCard
                    title="Expense Control"
                    score={breakdown?.expense_control || 0}
                    icon={<Activity className="w-4 h-4" />}
                    description="Spending discipline"
                />

                {/* Debt Pressure */}
                <BreakdownCard
                    title="Debt Pressure"
                    score={breakdown?.debt_pressure || 0}
                    icon={<AlertTriangle className="w-4 h-4" />}
                    description="Housing burden"
                    inverted
                />

                {/* Savings Discipline */}
                <BreakdownCard
                    title="Savings Discipline"
                    score={breakdown?.savings_discipline || 0}
                    icon={<TrendingUp className="w-4 h-4" />}
                    description="Savings rate"
                />
            </div>
        </div>
    )
}

const BreakdownCard = ({ title, score, icon, description, inverted = false }) => {
    let color = 'text-green-500'
    let bgColor = 'bg-green-950/30'
    let label = 'Good'

    const effectiveScore = inverted ? 100 - score : score

    if (effectiveScore < 30) {
        color = 'text-red-500'
        bgColor = 'bg-red-950/30'
        label = 'Critical'
    } else if (effectiveScore < 50) {
        color = 'text-orange-500'
        bgColor = 'bg-orange-950/30'
        label = 'Needs Attention'
    } else if (effectiveScore < 70) {
        color = 'text-yellow-500'
        bgColor = 'bg-yellow-950/30'
        label = 'Moderate'
    }

    return (
        <div className={`${bgColor} border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`${color}`}>{icon}</div>
                <span className={`text-xl font-bold font-mono ${color}`}>{score.toFixed(0)}</span>
            </div>
            <h5 className="text-xs font-mono text-gray-300 uppercase tracking-wide mb-1">{title}</h5>
            <p className="text-[10px] text-gray-500 font-mono">{description}</p>
            <div className={`text-[10px] font-mono mt-2 ${color}`}>{label}</div>
        </div>
    )
}

export default HealthScoreWithBreakdown
