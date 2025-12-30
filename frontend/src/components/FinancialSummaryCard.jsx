import { AlertTriangle, TrendingDown, Wallet, Clock, CheckCircle } from 'lucide-react'

const FinancialSummaryCard = ({ data }) => {
    const { status, primary_cause, urgent_action, recovery_horizon } = data.executive_summary

    let statusColors = 'bg-gray-800 text-white'
    let icon = <CheckCircle className="w-8 h-8 text-green-400" />

    if (status.includes('High')) {
        statusColors = 'bg-red-950/40 border-l-4 border-red-500'
        icon = <AlertTriangle className="w-8 h-8 text-red-500" />
    } else if (status.includes('Vulnerable') || status.includes('Medium')) {
        statusColors = 'bg-yellow-950/40 border-l-4 border-yellow-500'
        icon = <AlertTriangle className="w-8 h-8 text-yellow-500" />
    } else {
        statusColors = 'bg-green-950/40 border-l-4 border-green-500'
    }

    return (
        <div className={`p-6 rounded-lg border border-white/10 ${statusColors} mb-6 animate-fadeInUp`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                    {icon}
                    <div>
                        <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest">Financial Status</h2>
                        <h1 className="text-2xl font-bold font-mono tracking-tight">{status.toUpperCase()}</h1>
                    </div>
                </div>

                <div className="flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-full border border-white/5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono text-cyan-300">Recovery: {recovery_horizon}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                <div>
                    <div className="flex items-center text-xs font-mono text-gray-500 mb-1">
                        <TrendingDown className="w-3 h-3 mr-2" />
                        PRIMARY CAUSE
                    </div>
                    <p className="text-sm font-medium text-white/90">{primary_cause}</p>
                </div>
                <div>
                    <div className="flex items-center text-xs font-mono text-gray-500 mb-1">
                        <Wallet className="w-3 h-3 mr-2 text-green-400" />
                        IMMEDIATE ACTION
                    </div>
                    <p className="text-sm font-medium text-white/90">{urgent_action}</p>
                </div>
            </div>
        </div>
    )
}

export default FinancialSummaryCard
