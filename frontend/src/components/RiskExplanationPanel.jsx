import { Info, BarChart3, ChevronRight } from 'lucide-react'

const RiskExplanationPanel = ({ riskFactors }) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 animate-fadeInUp delay-100">
            <div className="flex items-center mb-6">
                <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                    <Info className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold font-mono tracking-wide text-white">WHY AM I AT RISK?</h3>
            </div>

            <div className="space-y-4">
                {riskFactors.length === 0 ? (
                    <div className="text-gray-400 font-mono text-sm italic">
                        No significant risk factors detected. Keep up the good work!
                    </div>
                ) : (
                    riskFactors.map((factor, index) => (
                        <div
                            key={index}
                            className="group bg-black/40 border border-white/5 rounded p-4 hover:border-cyan-500/30 transition-all cursor-default"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                    <BarChart3 className="w-4 h-4 text-cyan-500 mr-2" />
                                    <span className="font-mono text-sm font-bold text-gray-200">{factor.factor}</span>
                                </div>
                                <span className="font-mono text-xs text-red-400 bg-red-950/30 px-2 py-1 rounded border border-red-900/50">
                                    {factor.threshold}
                                </span>
                            </div>

                            <div className="flex justify-between items-end">
                                <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">
                                    {factor.explanation}
                                </p>
                                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-cyan-400 transition-colors" />
                            </div>

                            {/* Visual Impact Bar */}
                            <div className="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-cyan-900 to-cyan-400 h-full"
                                    style={{ width: `${factor.contribution_score * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-gray-600 text-center uppercase tracking-widest">
                AI-Driven Risk Factor Analysis
            </div>
        </div>
    )
}

export default RiskExplanationPanel
