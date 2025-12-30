import ActionPlanTable from '../ActionPlanTable'
import WhatIfSimulator from '../WhatIfSimulator'
import GoalPlanningWidget from '../GoalPlanningWidget'
import RecoveryTimeline from '../RecoveryTimeline'

const ActionCenterPage = ({ data, inputData }) => {
    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-mono mb-2">
                    Action <span className="text-cyan-400">Center</span>
                </h1>
                <p className="text-gray-400 text-sm font-mono">
                    Your personalized roadmap to financial wellness
                </p>
            </div>

            {/* Action Plan & What-If Simulator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Action Plan */}
                <div>
                    <ActionPlanTable recommendations={data.recommendations} />
                </div>

                {/* What-If Simulator */}
                <div>
                    <WhatIfSimulator
                        originalData={inputData}
                        currentScore={data.health_score}
                        currentHealthBreakdown={data.health_breakdown}
                    />
                </div>
            </div>

            {/* Goal Planning Widget */}
            <div className="mt-6">
                <GoalPlanningWidget householdData={inputData} />
            </div>

            {/* Recovery Timeline */}
            <div className="mt-6">
                <RecoveryTimeline
                    months={data.recovery_timeline_months}
                    savingsNeeded={data.monthly_savings_needed}
                />
            </div>


        </div>
    )
}

export default ActionCenterPage
