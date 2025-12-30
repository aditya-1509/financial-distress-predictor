import { useState, useRef } from 'react'
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

import PageLayout from './layout/PageLayout'
import OverviewPage from './pages/OverviewPage'
import AnalysisPage from './pages/AnalysisPage'
import ActionCenterPage from './pages/ActionCenterPage'

const ResultsDisplay = ({ data, onReset }) => {
    const [currentPage, setCurrentPage] = useState('overview') // 'overview' | 'analysis' | 'actions'
    const contentRef = useRef(null)

    if (!data) {
        return (
            <div className="text-center text-gray-400 font-mono p-8">
                <p>No results data available. Please try again.</p>
                <button onClick={onReset} className="mt-4 px-4 py-2 bg-cyan-500 text-black rounded font-mono">
                    NEW ANALYSIS
                </button>
            </div>
        )
    }

    // Data normalization
    const safeData = {
        health_score: data?.health_score ?? 0,
        executive_summary: data?.executive_summary || {
            status: 'Unknown',
            primary_cause: 'Unable to determine',
            urgent_action: 'Retry analysis',
            recovery_horizon: 'N/A'
        },
        risk_factors: data?.risk_factors || [],
        financial_metrics: data?.financial_metrics || {
            total_expenditure: 0,
            savings: 0,
            savings_rate_pct: 0,
            expenditure_to_income_pct: 0,
            housing_burden_pct: 0,
            essential_spending_pct: 0,
            discretionary_spending_pct: 0
        },
        recommendations: data?.recommendations || [],
        recovery_timeline_months: data?.recovery_timeline_months ?? 0,
        monthly_savings_needed: data?.monthly_savings_needed ?? 0,
        health_breakdown: data?.health_breakdown || {
            income_stability: 0,
            expense_control: 0,
            debt_pressure: 0,
            savings_discipline: 0
        }
    }

    // Calculate input data for what-if simulator
    const totalExp = safeData.financial_metrics.total_expenditure || 1
    const expToIncRatio = safeData.financial_metrics.expenditure_to_income_pct / 100 || 1
    const estimatedIncome = totalExp / expToIncRatio

    const inputData = {
        Net_Income: estimatedIncome || 0,
        Housing: (totalExp * (safeData.financial_metrics.housing_burden_pct / 100) / expToIncRatio) || 0,
        Food: totalExp * 0.3 || 0,
        Transport: 0,
        Health: 0,
        Education: 0,
        Recreation: (totalExp * (safeData.financial_metrics.discretionary_spending_pct / 100)) || 0,
        Clothing: 0,
        Communication: 0,
        Restaurants: 0,
        Miscellaneous: 0
    }

    // PDF Download Handler
    const handleDownloadPDF = async () => {
        try {
            const element = contentRef.current
            const canvas = await html2canvas(element)
            const imgData = canvas.toDataURL('image/png')

            const pdf = new jsPDF()
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save("financial_health_report.pdf")
        } catch (error) {
            console.error("PDF generation failed:", error)
            alert("PDF generation failed. Please try again.")
        }
    }

    // Navigation handlers
    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        if (currentPage === 'overview') {
            setCurrentPage('analysis')
        } else if (currentPage === 'analysis') {
            setCurrentPage('actions')
        }
    }

    const handleBack = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        if (currentPage === 'actions') {
            setCurrentPage('analysis')
        } else if (currentPage === 'analysis') {
            setCurrentPage('overview')
        }
    }

    // Determine current page number
    const pageNumber = currentPage === 'overview' ? 1 : currentPage === 'analysis' ? 2 : 3

    // Render current page
    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'overview':
                return <OverviewPage data={safeData} onNext={handleNext} />
            case 'analysis':
                return <AnalysisPage data={safeData} inputData={inputData} onNext={handleNext} />
            case 'actions':
                return <ActionCenterPage data={safeData} inputData={inputData} />
            default:
                return <OverviewPage data={safeData} onNext={handleNext} />
        }
    }

    return (
        <PageLayout
            currentPage={pageNumber}
            totalPages={3}
            onDownloadPDF={handleDownloadPDF}
            onReset={onReset}
            showBackButton={currentPage !== 'overview'}
            onBack={handleBack}
        >
            <div ref={contentRef}>
                {renderCurrentPage()}
            </div>
        </PageLayout>
    )
}

export default ResultsDisplay
