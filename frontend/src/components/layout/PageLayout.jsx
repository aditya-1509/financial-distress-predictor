import { Download, ArrowLeft } from 'lucide-react'

const PageLayout = ({
    children,
    currentPage,
    totalPages = 3,
    onDownloadPDF,
    onReset,
    showBackButton = false,
    onBack,
    title
}) => {
    const progressPercentage = (currentPage / totalPages) * 100

    return (
        <div className="min-h-screen bg-black text-white py-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full stars-bg opacity-30"></div>
                <div className="absolute top-0 -left-10 w-40 h-full border-r border-cyan-500/10"></div>
                <div className="absolute top-0 right-10 w-40 h-full border-l border-cyan-500/10"></div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                {/* Top Action Bar - Sticky */}
                <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {showBackButton && onBack && (
                                <button
                                    onClick={onBack}
                                    className="flex items-center gap-2 text-cyan-400 hover:text-white transition-colors text-sm font-mono group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    <span className="hidden sm:inline">BACK</span>
                                </button>
                            )}

                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                                    {title || `Page ${currentPage} of ${totalPages}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {onDownloadPDF && (
                                <button
                                    onClick={onDownloadPDF}
                                    className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">EXPORT PDF</span>
                                </button>
                            )}

                            {onReset && (
                                <button
                                    onClick={onReset}
                                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-900/50 px-4 py-1 rounded hover:bg-cyan-900/20 transition-all"
                                >
                                    NEW ANALYSIS
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-2 text-[10px] font-mono text-gray-500">
                                <span className={currentPage === 1 ? 'text-cyan-400' : ''}>OVERVIEW</span>
                                <span>→</span>
                                <span className={currentPage === 2 ? 'text-cyan-400' : ''}>ANALYSIS</span>
                                <span>→</span>
                                <span className={currentPage === 3 ? 'text-cyan-400' : ''}>ACTIONS</span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-500">
                                {currentPage}/{totalPages}
                            </span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="animate-fadeIn">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default PageLayout
