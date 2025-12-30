import { ArrowUpCircle, ArrowDownCircle, CheckCircle, AlertCircle } from 'lucide-react'

const ActionPlanTable = ({ recommendations = [] }) => {
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden animate-fadeInUp delay-300 p-6">
                <h3 className="text-lg font-bold font-mono tracking-wide text-white mb-2">CORRECTIVE ACTION PLAN</h3>
                <p className="text-sm text-gray-400 font-mono">No specific actions required at this time.</p>
            </div>
        )
    }

    const getPriorityStyle = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-red-400 bg-red-950/30 border-red-900/50';
            case 'medium': return 'text-yellow-400 bg-yellow-950/30 border-yellow-900/50';
            default: return 'text-green-400 bg-green-950/30 border-green-900/50';
        }
    }

    const getRecommendationTitle = (rec) => {
        if (typeof rec === 'string') return rec;
        if (rec.title) return rec.title;
        if (rec.recommendation) return rec.recommendation.split(':')[0];
        if (rec.message) return rec.message;
        return 'Recommendation';
    }

    const getRecommendationDetails = (rec) => {
        if (typeof rec === 'string') return '';
        if (rec.message && rec.action) return `${rec.message}. ${rec.action}`;
        if (rec.message) return rec.message;
        if (rec.action) return rec.action;
        if (rec.recommendation) {
            const parts = rec.recommendation.split(':');
            return parts[1] || parts[0];
        }
        return '';
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden animate-fadeInUp delay-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold font-mono tracking-wide text-white mb-1">CORRECTIVE ACTION PLAN</h3>
                    <p className="text-xs text-gray-400 font-mono">Prioritized steps to mitigate financial distress</p>
                </div>
                <div className="bg-cyan-500/10 p-2 rounded-full hidden md:block">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                </div>
            </div>

            <div className="overflow-y-auto max-h-80">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-black/90 z-10">
                        <tr className="text-xs font-mono text-gray-500 uppercase tracking-wider border-b border-white/5">
                            <th className="p-4 w-24">Priority</th>
                            <th className="p-4">Action Strategy</th>
                            <th className="p-4 w-40 hidden md:table-cell">Category</th>
                            <th className="p-4 w-32">Effect</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {recommendations.map((rec, index) => (
                            <tr key={index} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-mono border uppercase ${getPriorityStyle(rec.priority)}`}>
                                        {rec.priority || 'Low'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm text-gray-200 font-medium group-hover:text-cyan-400 transition-colors">
                                        {getRecommendationTitle(rec)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 max-w-lg">
                                        {getRecommendationDetails(rec)}
                                    </p>
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded">
                                        {rec.category || 'General'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center space-x-2">
                                        <ArrowDownCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-xs text-green-400 font-mono">Risk</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5 flex items-center justify-center space-x-2 text-xs text-gray-500 font-mono">
                <AlertCircle className="w-3 h-3" />
                <span>Actions are sorted by potential impact on your health score.</span>
            </div>
        </div>
    )
}

export default ActionPlanTable
