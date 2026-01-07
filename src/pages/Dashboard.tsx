import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { useStore } from '../lib/store';
import { subMonths, format, isSameMonth, parseISO } from 'date-fns';

const StatCard = ({ title, value, trend }: any) => {
    // Determine trend color and icon based on the 'trend' prop (number)
    const isPositive = trend >= 0;
    const isGood = title === 'High SLA Risk' ? !isPositive : isPositive; // For SLA risk, up is bad

    // For specific styling
    const trendColor = isGood ? 'text-green-500' : 'text-red-500';
    const bgTrend = isGood ? 'bg-green-500/10' : 'bg-red-500/10';

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <h3 className="text-3xl font-bold mt-2 text-white">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${bgTrend} ${trendColor}`}>
                    {isGood ? <TrendingUp className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className={`${trendColor} flex items-center`}>
                    {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                    {Math.abs(trend).toFixed(1)}%
                </span>
                <span className="text-slate-500 ml-2">vs last month</span>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const { cases, dcas } = useStore();

    // -- Memoized Calculations for Performance --

    const metrics = useMemo(() => {
        const now = new Date();
        const lastMonth = subMonths(now, 1);

        // Helper to check bucket
        const isCurrentMonth = (dateStr: string) => isSameMonth(parseISO(dateStr), now);
        const isLastMonth = (dateStr: string) => isSameMonth(parseISO(dateStr), lastMonth);

        // 1. Total Recovered
        // Definition: Sum of amount for Status=RESOLVED
        const resolvedCases = cases.filter(c => c.status === 'RESOLVED');
        const totalRecovered = resolvedCases.reduce((acc, c) => acc + c.amount, 0);

        // Trend: Recovered this month vs last month (based on createdAt as proxy for resolution time in mock)
        const recoveredThisMonth = resolvedCases.filter(c => isCurrentMonth(c.createdAt)).reduce((acc, c) => acc + c.amount, 0);
        const recoveredLastMonth = resolvedCases.filter(c => isLastMonth(c.createdAt)).reduce((acc, c) => acc + c.amount, 0);
        const recoveredTrend = recoveredLastMonth > 0 ? ((recoveredThisMonth - recoveredLastMonth) / recoveredLastMonth) * 100 : 100;

        // 2. Active Volume
        // Definition: Status is NOT Resolved/Closed
        const activeCases = cases.filter(c => !['RESOLVED', 'CLOSED', 'UNRECOVERABLE'].includes(c.status));
        const activeCount = activeCases.length;

        // Trend: New Active Cases this month vs last month
        const activeThisMonth = activeCases.filter(c => isCurrentMonth(c.createdAt)).length;
        const activeLastMonth = activeCases.filter(c => isLastMonth(c.createdAt)).length;
        const activeTrend = activeLastMonth > 0 ? ((activeThisMonth - activeLastMonth) / activeLastMonth) * 100 : 0;

        // 3. High SLA Risk
        const slaBreaches = cases.filter(c => c.aiAnalysis?.slaBreachRisk === 'HIGH').length;
        // Trend: High Risk cases created this month vs last
        const riskThisMonth = cases.filter(c => c.aiAnalysis?.slaBreachRisk === 'HIGH' && isCurrentMonth(c.createdAt)).length;
        const riskLastMonth = cases.filter(c => c.aiAnalysis?.slaBreachRisk === 'HIGH' && isLastMonth(c.createdAt)).length;
        const riskTrend = riskLastMonth > 0 ? ((riskThisMonth - riskLastMonth) / riskLastMonth) * 100 : 0;

        // 4. AI Accuracy
        // Definition: Resolved cases where Prob > 80% (aligned with mock gen)
        const correctlyPredicted = resolvedCases.filter(c => (c.aiAnalysis?.recoveryProbability || 0) > 80).length;
        const accuracy = resolvedCases.length > 0 ? (correctlyPredicted / resolvedCases.length) * 100 : 0;
        // Mock trend for AI since we don't store historical accuracy snapshots
        const accuracyTrend = 1.4;

        return {
            totalRecovered,
            recoveredTrend,
            activeCount,
            activeTrend,
            slaBreaches,
            riskTrend,
            accuracy,
            accuracyTrend
        };
    }, [cases]);

    const chartData = useMemo(() => {
        // Group amounts by Month (using createdAt)
        const months: Record<string, number> = {};
        cases.forEach(c => {
            if (c.status === 'RESOLVED') {
                const date = parseISO(c.createdAt);
                const key = format(date, 'MMM');
                if (!months[key]) months[key] = 0;
                months[key] += c.amount;
            }
        });

        const orderedMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return orderedMonths.map(m => ({
            name: m,
            recovered: months[m] || 0
        }));
    }, [cases]);

    const dcaPerformanceData = useMemo(() => {
        return dcas.map(dca => {
            const dcaCases = cases.filter(c => c.assignedDcaId === dca.id && c.status === 'RESOLVED');
            const total = dcaCases.reduce((acc, c) => acc + c.amount, 0);
            return {
                name: dca.name.split(' ')[0], // Short name
                recovered: total,
                full: dca.name
            };
        }).sort((a, b) => b.recovered - a.recovered);
    }, [cases, dcas]);


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Executive Overview</h1>
                <p className="text-slate-400 mt-1">Real-time recovery intelligence and operational health.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Recovered"
                    value={`$${(metrics.totalRecovered / 1000).toFixed(1)}k`}
                    trend={metrics.recoveredTrend}
                    icon={DollarSign}
                />
                <StatCard
                    title="Active Volume"
                    value={metrics.activeCount}
                    trend={metrics.activeTrend}
                    icon={Activity}
                />
                <StatCard
                    title="High SLA Risk"
                    value={metrics.slaBreaches}
                    trend={metrics.riskTrend}
                />
                <StatCard
                    title="AI Accuracy"
                    value={`${metrics.accuracy.toFixed(1)}%`}
                    trend={metrics.accuracyTrend}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-6">Recovery Trends (YTD)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#ffffff" tick={{ fill: '#ffffff' }} />
                                <YAxis stroke="#ffffff" tick={{ fill: '#ffffff' }}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Recovered']}
                                />
                                <Area type="monotone" dataKey="recovered" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRec)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Top Performing DCAs</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dcaPerformanceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" stroke="#ffffff" tick={{ fill: '#ffffff' }} tickFormatter={(val) => `$${val / 1000}k`} />
                                <YAxis dataKey="name" type="category" stroke="#ffffff" tick={{ fill: '#ffffff' }} width={80} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Recovered']}
                                />
                                <Bar dataKey="recovered" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
