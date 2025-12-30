import { useState } from 'react'
import { Cpu, Database, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'

const ModelTransparency = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-white/5 rounded-lg overflow-hidden mt-12 animate-fadeInUp delay-1000">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors text-left"
            >
                <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">System Architecture & Model Logic</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>

            {isOpen && (
                <div className="p-6 bg-black/40 text-sm border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center mb-3 text-cyan-400 font-mono font-bold text-xs">
                            <Cpu className="w-4 h-4 mr-2" />
                            MODEL SPECIFICATION
                        </div>
                        <ul className="space-y-2 text-gray-400 font-mono text-xs">
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>Algorithm</span>
                                <span className="text-gray-300">CatBoost Classifier v1.2</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>Training Accuracy</span>
                                <span className="text-gray-300">95.4% (Holdout set)</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>Loss Function</span>
                                <span className="text-gray-300">Logloss</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>Optimization Goal</span>
                                <span className="text-gray-300">Recall (High Distress)</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <div className="flex items-center mb-3 text-purple-400 font-mono font-bold text-xs">
                            <Database className="w-4 h-4 mr-2" />
                            DATA INTEGRITY
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed mb-4">
                            Model trained on 41,545 household records from the Household Budget Survey.
                            Features are normalized and engineered for robust prediction across varied demographic segments.
                            Interpretation layer uses SHAP (SHapley Additive exPlanations) values for local explainability.
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-600 border border-white/5 rounded px-2 py-1 inline-block">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span>v1.0.0 Production</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ModelTransparency
