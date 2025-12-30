import { Gauge, Activity } from 'lucide-react'

const FinancialHealthScore = ({ score }) => {
    let color = 'text-green-500'
    let ringColor = 'stroke-green-500'
    let message = 'Healthy'

    if (score < 40) {
        color = 'text-red-500'
        ringColor = 'stroke-red-500'
        message = 'Distressed'
    } else if (score < 70) {
        color = 'text-yellow-500'
        ringColor = 'stroke-yellow-500'
        message = 'Vulnerable'
    }

    const radius = 60
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-cyan-500/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-32 h-32" />
            </div>

            <h3 className="text-sm font-mono text-gray-400 mb-4 uppercase tracking-widest flex items-center">
                <Gauge className="w-4 h-4 mr-2" />
                Health Score
            </h3>

            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className="stroke-gray-800"
                        strokeWidth="12"
                        fill="transparent"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className={`${ringColor} transition-all duration-1000 ease-out`}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold font-mono ${color}`}>{score}</span>
                    <span className={`text-xs font-mono tracking-widest ${color}`}>{message}</span>
                </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4 max-w-[200px]">
                A compounded metric of solvency, liquidity, and stability.
            </p>
        </div>
    )
}

export default FinancialHealthScore
