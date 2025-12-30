import { ChevronRight } from 'lucide-react'
import FinancialSummaryCard from '../FinancialSummaryCard'
import HealthScoreWithBreakdown from '../HealthScoreWithBreakdown'

const OverviewPage = ({ data, onNext }) => {
    return (
        <div className="space-y-6 pb-20">
            {/* Hero Section */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-mono mb-2">
                    Financial <span className="text-cyan-400">Health Report</span>
                </h1>
                <p className="text-gray-400 text-sm font-mono">
                    Your personalized financial wellness assessment
                </p>
            </div>

            {/* Executive Summary */}
            <FinancialSummaryCard data={data} />

            {/* Health Score Section */}
            <div className="mt-8">
                <HealthScoreWithBreakdown
                    score={data.health_score}
                    breakdown={data.health_breakdown}
                />
            </div>

            {/* Call to Action */}
            <div className="flex justify-center mt-12">
                <button
                    onClick={onNext}
                    className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-mono font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-3"
                >
                    <span>SEE DETAILED ANALYSIS</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                    {/* Animated border */}
                    <span className="absolute inset-0 border-2 border-cyan-400/50 group-hover:border-cyan-400 transition-colors"></span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 p-4 border border-white/10 rounded-lg bg-white/5">
                <div className="flex flex-wrap justify-around gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-cyan-400 font-mono">
                            {data.financial_metrics.savings_rate_pct?.toFixed(1) || 0}%
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">Savings Rate</div>
                    </div>
                    <div className="h-12 w-px bg-white/10"></div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-400 font-mono">
                            {data.health_score || 0}/100
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">Health Score</div>
                    </div>
                    <div className="h-12 w-px bg-white/10"></div>
                    <div>
                        <div className="text-2xl font-bold text-purple-400 font-mono">
                            {data.recommendations?.length || 0}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">Recommendations</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewPage
