import { Home, CreditCard, PiggyBank, Briefcase } from 'lucide-react'

const KeyFinancialMetrics = ({ metrics, inputData }) => {
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

    const metricItems = [
        {
            icon: <Briefcase className="w-5 h-5 text-purple-400" />,
            label: "Monthly Income",
            value: formatCurrency(inputData.Net_Income),
            subtext: "Net earnings"
        },
        {
            icon: <CreditCard className="w-5 h-5 text-red-400" />,
            label: "Total Expenses",
            value: formatCurrency(metrics.total_expenditure),
            subtext: `You spend ${metrics.expenditure_to_income_pct}% of what you earn`
        },
        {
            icon: <PiggyBank className="w-5 h-5 text-green-400" />,
            label: "Monthly Savings",
            value: formatCurrency(metrics.savings),
            subtext: `${metrics.savings_rate_pct}% savings rate`
        },
        {
            icon: <Home className="w-5 h-5 text-blue-400" />,
            label: "Housing Cost",
            value: formatCurrency(inputData.Housing),
            subtext: `Consumes ${metrics.housing_burden_pct}% of income`
        }
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp delay-200">
            {metricItems.map((item, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                            {item.icon}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-xl font-bold font-mono text-white mb-1">{item.value}</p>
                        <p className="text-[10px] font-mono text-gray-500">{item.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default KeyFinancialMetrics
