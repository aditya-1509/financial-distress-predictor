import { useEffect, useRef, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const MatrixRain = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        const columns = Math.floor(width / 20);
        const drops = [];
        const chars = "01$£€¥₿%#";

        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);
            ctx.font = '14px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                if (text === '$' || text === '£' || text === '€' || text === '¥' || text === '₿') {
                    ctx.fillStyle = '#22d3ee';
                } else if (text === '%') {
                    ctx.fillStyle = '#f472b6';
                } else {
                    ctx.fillStyle = '#0f766e';
                }
                ctx.fillText(text, i * 20, drops[i] * 20);
                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-20" />;
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-surface/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl">
                <p className="text-slate-400 text-xs font-mono mb-1">
                    {new Date(data.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-emerald-400 font-bold text-lg font-mono tracking-tight">
                    Growing ↗
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Activity</span>
                    <span className="text-xs text-slate-300 font-mono">{data.volume.toLocaleString()}</span>
                </div>
            </div>
        );
    }
    return null;
};

const LiveChart = ({ data, color }) => {
    const gradientId = "colorPrice";

    const domain = useMemo(() => {
        if (data.length === 0) return [0, 100];
        const prices = data.map(d => d.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const padding = (max - min) * 0.2;
        return [min - padding, max + padding];
    }, [data]);

    const latestPoint = data[data.length - 1];

    return (
        <div className="w-full h-full relative group cursor-crosshair">
            <div
                className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500"
                style={{ background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)` }}
            />

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                        <filter id="glow" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 10 -3" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#1e293b"
                        opacity={0.5}
                    />

                    <XAxis
                        dataKey="time"
                        hide
                        domain={['dataMin', 'dataMax']}
                        type="number"
                    />

                    <YAxis
                        domain={domain}
                        orientation="right"
                        tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                        tickFormatter={(val) => val.toFixed(2)}
                        allowDecimals={true}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                        isAnimationActive={false}
                    />

                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#${gradientId})`}
                        isAnimationActive={false}
                        filter="url(#glow)"
                    />

                    {latestPoint && (
                        <ReferenceLine
                            y={latestPoint.price}
                            stroke={color}
                            strokeDasharray="3 3"
                            opacity={0.5}
                            strokeWidth={1}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>

            <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color === '#10B981' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${color === '#10B981' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </div>
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400">LIVE MARKET</span>
            </div>
        </div>
    );
};

const FinancialBlueprint = () => {
    const [data, setData] = useState([]);
    const dataRef = useRef([]);

    useEffect(() => {
        const initialData = [];
        let currentPrice = 150;
        const now = Date.now();

        for (let i = 60; i > 0; i--) {
            const change = (Math.random() - 0.5) * 1.5;
            currentPrice += change;
            initialData.push({
                time: now - i * 1000,
                price: Math.max(0.01, currentPrice),
                volume: Math.floor(Math.random() * 1000) + 100
            });
        }

        setData(initialData);
        dataRef.current = initialData;
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentData = dataRef.current;
            if (currentData.length === 0) return;

            const lastPoint = currentData[currentData.length - 1];
            // Always positive growth with some variation
            const baseGrowth = 0.3;
            const randomVariation = Math.random() * 0.4;
            const change = baseGrowth + randomVariation; // Always positive!
            let newPrice = lastPoint.price + change;
            newPrice = Math.max(0.01, newPrice);

            const newPoint = {
                time: Date.now(),
                price: newPrice,
                volume: Math.floor(Math.random() * 2000) + 500
            };

            const updatedData = [...currentData, newPoint];
            if (updatedData.length > 100) {
                updatedData.shift();
            }

            dataRef.current = updatedData;
            setData(updatedData);
        }, 800);

        return () => clearInterval(interval);
    }, []);

    const currentPrice = data.length > 0 ? data[data.length - 1].price : 0;
    const startPrice = data.length > 0 ? data[0].price : 0;
    const priceChange = currentPrice - startPrice;
    const percentChange = startPrice !== 0 ? (priceChange / startPrice) * 100 : 0;
    const isPositive = true; // Always positive since we only grow!
    const accentColor = '#10B981'; // Always green for growth

    return (
        <div className="relative w-[100%] h-[400px]">
            <div className="bg-[#0B0E14] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
                    <div>
                        <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            WEALTH GROWTH
                        </div>
                        <div className="text-2xl font-mono font-bold text-emerald-400 tracking-tight">
                            Building Your Future
                        </div>
                    </div>
                    <div className="text-right text-emerald-500">
                        <div className="flex items-center justify-end gap-1 font-bold text-3xl">
                            ↗
                            {Math.abs(percentChange).toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-0 relative">
                    <LiveChart data={data} color={accentColor} />
                </div>
            </div>
        </div>
    );
};

const LandingPage = ({ onStartAnalysis }) => {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black group selection:bg-cyan-400 selection:text-black font-mono">
            <MatrixRain />
            <div className="absolute top-1/2 left-3/4 transform -translate-x-1/2 -translate-y-1/2 z-0 hidden lg:block" style={{ width: '40%' }}>
                <FinancialBlueprint />
            </div>
            <div className="absolute inset-0 w-full h-full lg:hidden stars-bg opacity-30"></div>
            <div className="absolute top-0 left-0 right-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-white text-xl lg:text-2xl font-bold tracking-widest italic transform -skew-x-12">SpendIQ.ai</div>
                        <div className="h-4 w-px bg-white/40"></div>
                        <span className="text-white/60 text-[10px]">EST. 2025</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-3 text-[10px] text-white/60">
                        <span>SYSTEM STATUS: ONLINE</span>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/30 z-20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/30 z-20 pointer-events-none"></div>
            <div className="absolute left-0 w-12 h-12 border-b-2 border-l-2 border-white/30 z-20 pointer-events-none" style={{ bottom: '0' }}></div>
            <div className="absolute right-0 w-12 h-12 border-b-2 border-r-2 border-white/30 z-20 pointer-events-none" style={{ bottom: '0' }}></div>
            <div className="relative z-10 flex min-h-screen items-center">
                <div className="container mx-auto px-6 lg:px-16 lg:ml-[8%]">
                    <div className="max-w-2xl relative">
                        <div className="flex items-center gap-2 mb-4 opacity-60">
                            <div className="w-8 h-px bg-cyan-400"></div>
                            <span className="text-cyan-400 text-[10px] tracking-wider">FINANCIAL INTELLIGENCE UNIT</span>
                            <div className="flex-1 max-w-[100px] h-px bg-cyan-400/50"></div>
                        </div>
                        <div className="relative mb-6">
                            <div className="hidden lg:block absolute -left-4 top-0 bottom-0 w-2 dither-pattern opacity-50"></div>
                            <h1 className="text-4xl lg:text-7xl font-bold text-white leading-none tracking-wider" style={{ letterSpacing: '0.05em', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                                MASTER YOUR
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white mt-2">FINANCIAL FUTURE</span>
                            </h1>
                        </div>
                        <div className="hidden lg:flex gap-1.5 mb-6 opacity-50">
                            {Array.from({ length: 24 }).map((_, i) => (<div key={i} className={`w-0.5 h-0.5 rounded-full ${i < 12 ? 'bg-cyan-400' : 'bg-white'}`}></div>))}
                        </div>
                        <div className="relative max-w-xl">
                            <p className="text-sm lg:text-lg text-gray-300 mb-8 leading-relaxed opacity-90">
                                AI-powered health assessment in seconds. Get personalized insights and optimize your spending with algorithmic precision.
                            </p>
                            <div className="hidden lg:block absolute -right-8 top-1/2 w-4 h-4 border border-cyan-400/60 opacity-50" style={{ transform: 'translateY(-50%) rotate(45deg)' }}>
                                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400" style={{ transform: 'translate(-50%, -50%)' }}></div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 relative z-30">
                            <button onClick={onStartAnalysis} className="relative overflow-hidden px-8 py-3 bg-white/10 backdrop-blur-md text-white text-sm border border-white/40 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 transition-all duration-300 group/btn cursor-pointer">
                                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white opacity-50 group-hover/btn:opacity-100 transition-opacity"></span>
                                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white opacity-50 group-hover/btn:opacity-100 transition-opacity"></span>
                                ANALYZE MY FINANCES &gt;
                            </button>
                            <button className="relative px-8 py-3 bg-transparent border border-white/30 text-white/80 text-sm hover:bg-white/5 hover:text-white transition-all duration-300 cursor-not-allowed opacity-50">VIEW DEMO (SOON)</button>
                        </div>
                        <div className="hidden lg:flex items-center gap-3 mt-12 opacity-50">
                            <span className="text-cyan-400 text-[9px]">INITIALIZING AI MODEL</span>
                            <div className="w-12 h-px bg-cyan-400/50"></div>
                            <span className="text-white/60 text-[9px]">SUCCESS PROBABILITY: 99.9%</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute left-0 right-0 bottom-0 z-20 border-t border-white/10 bg-black/40 backdrop-blur-md">
                <div className="container mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6 text-[9px] text-white/50">
                        <span className="hidden lg:inline">SPENDIQ ENGINE.ACTIVE</span>
                        <div className="hidden lg:flex gap-0.5 items-end h-4">
                            {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="w-0.5 bg-cyan-400/50" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>))}
                        </div>
                        <span>V2.1.0 (STABLE)</span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] text-white/50">
                        <span className="hidden lg:inline">Live Data Feed</span>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default LandingPage;
