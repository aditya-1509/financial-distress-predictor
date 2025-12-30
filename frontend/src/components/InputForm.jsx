import { useState } from 'react'
import { DollarSign, Home, Car, Heart, GraduationCap, Smartphone, ShoppingBag, UtensilsCrossed, Ticket, Package, Loader } from 'lucide-react'

const InputForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        Net_Income: '',
        Food: '',
        Housing: '',
        Transport: '',
        Health: '',
        Education: '',
        Recreation: '',
        Clothing: '',
        Communication: '',
        Restaurants: '',
        Miscellaneous: '',
        Household_Size: '4',
        Region: 'Central Hungary',
        Household_Type: 'Family with children',
        Employment_Status: 'Employed',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const processedData = {
            ...formData,
            Net_Income: parseFloat(formData.Net_Income) || 0,
            Food: parseFloat(formData.Food) || 0,
            Housing: parseFloat(formData.Housing) || 0,
            Transport: parseFloat(formData.Transport) || 0,
            Health: parseFloat(formData.Health) || 0,
            Education: parseFloat(formData.Education) || 0,
            Recreation: parseFloat(formData.Recreation) || 0,
            Clothing: parseFloat(formData.Clothing) || 0,
            Communication: parseFloat(formData.Communication) || 0,
            Restaurants: parseFloat(formData.Restaurants) || 0,
            Miscellaneous: parseFloat(formData.Miscellaneous) || 0,
            Household_Size: parseInt(formData.Household_Size) || 4,
        }

        onSubmit(processedData)
    }

    const inputFields = [
        { name: 'Net_Income', label: 'Monthly Net Income', icon: <DollarSign className="w-5 h-5" />, required: true },
        { name: 'Food', label: 'Food Expenses', icon: <UtensilsCrossed className="w-5 h-5" /> },
        { name: 'Housing', label: 'Housing & Utilities', icon: <Home className="w-5 h-5" /> },
        { name: 'Transport', label: 'Transportation', icon: <Car className="w-5 h-5" /> },
        { name: 'Health', label: 'Healthcare', icon: <Heart className="w-5 h-5" /> },
        { name: 'Education', label: 'Education', icon: <GraduationCap className="w-5 h-5" /> },
        { name: 'Recreation', label: 'Recreation & Entertainment', icon: <Ticket className="w-5 h-5" /> },
        { name: 'Clothing', label: 'Clothing', icon: <ShoppingBag className="w-5 h-5" /> },
        { name: 'Communication', label: 'Communication (Phone/Internet)', icon: <Smartphone className="w-5 h-5" /> },
        { name: 'Restaurants', label: 'Restaurants & Dining Out', icon: <UtensilsCrossed className="w-5 h-5" /> },
        { name: 'Miscellaneous', label: 'Miscellaneous', icon: <Package className="w-5 h-5" /> },
    ]

    return (
        <div className="max-w-5xl mx-auto animate-fadeInUp">
            <h2 className="text-2xl font-bold text-white mb-2 font-mono">FINANCIAL DATA INPUT</h2>
            <p className="text-gray-400 mb-8 font-mono text-sm">Initialize analysis sequence with monthly financial parameters.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Income Section */}
                <div className="bg-white/5 p-6 border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center font-mono">
                        <DollarSign className="w-5 h-5 mr-2 text-blue-400" />
                        INCOME METRICS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                                Monthly Net Income <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-500 font-mono">$</span>
                                <input
                                    type="number"
                                    name="Net_Income"
                                    value={formData.Net_Income}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 text-white font-mono pl-8 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder-gray-700"
                                    placeholder="0.00"
                                    required
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Household Size</label>
                            <input
                                type="number"
                                name="Household_Size"
                                value={formData.Household_Size}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 text-white font-mono px-4 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                                min="1"
                                max="15"
                            />
                        </div>
                    </div>
                </div>

                {/* Expenses Section */}
                <div className="bg-white/5 p-6 border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center font-mono">
                        <Package className="w-5 h-5 mr-2 text-purple-400" />
                        EXPENDITURE DATA
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inputFields.slice(1).map((field) => (
                            <div key={field.name}>
                                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider flex items-center overflow-hidden whitespace-nowrap text-ellipsis">
                                    <span className="text-gray-500 mr-2">{field.icon}</span>
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3.5 text-gray-500 font-mono">$</span>
                                    <input
                                        type="number"
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 text-white font-mono pl-8 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder-gray-700"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Demographics Section */}
                <div className="bg-white/5 p-6 border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500/50"></div>
                    <h3 className="text-lg font-bold text-white mb-4 font-mono">ADDITIONAL PARAMETERS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Region</label>
                            <select
                                name="Region"
                                value={formData.Region}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 text-white font-mono px-4 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all appearance-none"
                            >
                                <option>Central Hungary</option>
                                <option>Central Transdanubia</option>
                                <option>Western Transdanubia</option>
                                <option>Southern Transdanubia</option>
                                <option>Northern Hungary</option>
                                <option>Northern Great Plain</option>
                                <option>Southern Great Plain</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Household Type</label>
                            <select
                                name="Household_Type"
                                value={formData.Household_Type}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 text-white font-mono px-4 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all appearance-none"
                            >
                                <option>Single</option>
                                <option>Couple</option>
                                <option>Family with children</option>
                                <option>Multi-generational</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Employment Status</label>
                            <select
                                name="Employment_Status"
                                value={formData.Employment_Status}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 text-white font-mono px-4 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all appearance-none"
                            >
                                <option>Employed</option>
                                <option>Self-employed</option>
                                <option>Unemployed</option>
                                <option>Retired</option>
                                <option>Student</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white text-black font-mono font-bold py-4 px-12 hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full md:w-auto relative overflow-hidden group"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>PROCESSING DATA...</span>
                            </>
                        ) : (
                            <>
                                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black opacity-50"></span>
                                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black opacity-50"></span>
                                <span>INITIALIZE ANALYSIS</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default InputForm
