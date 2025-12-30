import { Calendar, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const RecoveryTimeline = ({ months, savingsNeeded }) => {
    if (months <= 0) {
        return (
            <div className="bg-green-950/20 border border-green-500/20 rounded-lg p-6 animate-fadeInUp delay-700 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold font-mono text-green-400 tracking-wide mb-1">FINANCIAL STABILITY ACHIEVED</h3>
                    <p className="text-sm text-gray-400 font-mono">You are currently in a healthy financial zone.</p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
            </div>
        )
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 animate-fadeInUp delay-700">
            <div className="flex items-center mb-6">
                <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold font-mono text-white tracking-wide">RECOVERY TIMELINE</h3>
                    <p className="text-xs text-gray-400 font-mono">Projected path to financial health</p>
                </div>
            </div>

            <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={[
                            { month: 'Now', current: 20, recovery: 20 },
                            { month: `Month ${Math.round(months * 0.25)}`, current: 18, recovery: 40 },
                            { month: `Month ${Math.round(months * 0.5)}`, current: 15, recovery: 60 },
                            { month: `Month ${Math.round(months * 0.75)}`, current: 12, recovery: 80 },
                            { month: `Month ${months}`, current: 10, recovery: 100 },
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="recoveryGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #374151', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelStyle={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                        {/* Current Path (Stagnation) */}
                        <Line
                            type="monotone"
                            dataKey="current"
                            name="Current Path (Inaction)"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 4, fill: '#ef4444' }}
                        />

                        {/* Recovery Path (Growth) */}
                        <Line
                            type="monotone"
                            dataKey="recovery"
                            name="Recovery Plan"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#10b981' }}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-black/30 rounded border border-white/5 p-4 flex items-center space-x-4">
                <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <p className="text-sm text-gray-300 font-mono">
                    By saving <span className="text-white font-bold">{formatCurrency(savingsNeeded)}/mo</span>, you can reach the safe zone in <span className="text-white font-bold">{months} months</span>.
                </p>
            </div>
        </div>
    )
}

export default RecoveryTimeline
