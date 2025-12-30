import { ChevronRight } from 'lucide-react'
import KeyFinancialMetrics from '../KeyFinancialMetrics'
import RiskExplanationPanel from '../RiskExplanationPanel'

const AnalysisPage = ({ data, inputData, onNext }) => {
    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-mono mb-2">
                    Deep Dive <span className="text-cyan-400">Analysis</span>
                </h1>
                <p className="text-gray-400 text-sm font-mono">
                    Detailed metrics and risk factor breakdown
                </p>
            </div>

            {/* Key Financial Metrics */}
            <div className="mb-8">
                <KeyFinancialMetrics
                    metrics={data.financial_metrics}
                    inputData={inputData}
                />
            </div>

            {/* Risk Explanation Panel */}
            <div className="mb-8">
                <RiskExplanationPanel riskFactors={data.risk_factors} />
            </div>

            {/* Insights Summary Box */}
            <div className="p-6 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="text-yellow-500 text-2xl">💡</div>
                    <div>
                        <h3 className="text-yellow-400 font-bold font-mono mb-2">KEY INSIGHT</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {data.executive_summary?.primary_cause ||
                                "Your financial health is primarily influenced by your expense-to-income ratio and savings discipline."}
                        </p>
                        {data.executive_summary?.urgent_action && (
                            <p className="text-cyan-400 text-sm mt-3 font-mono">
                                ⚡ {data.executive_summary.urgent_action}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="flex justify-center mt-12">
                <button
                    onClick={onNext}
                    className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-mono font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-3"
                >
                    <span>VIEW ACTION PLAN</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                    {/* Animated border */}
                    <span className="absolute inset-0 border-2 border-cyan-400/50 group-hover:border-cyan-400 transition-colors"></span>
                </button>
            </div>
        </div>
    )
}

export default AnalysisPage
