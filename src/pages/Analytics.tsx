import { useMemo } from 'react';
import { useStore } from '../lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';

export const Analytics = () => {
    const { cases } = useStore();

    // Data for Pie Chart (Status Distribution)
    const statusData = useMemo(() => [
        { name: 'Resolved', value: cases.filter(c => c.status === 'RESOLVED').length, color: '#10B981' }, // green
        { name: 'In Progress', value: cases.filter(c => c.status === 'IN_PROGRESS').length, color: '#F59E0B' }, // amber
        { name: 'Assigned', value: cases.filter(c => c.status === 'ASSIGNED').length, color: '#3B82F6' }, // blue
        { name: 'Unassigned', value: cases.filter(c => c.status === 'NEW').length, color: '#64748B' }, // slate
    ], [cases]);

    // Dynamic Trend Data for Line Chart (Last 7 Days)
    const trendData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dayLabel = format(date, 'EEE'); // Mon, Tue...

            // Count interactions for this day
            let callCount = 0;
            let emailCount = 0;

            cases.forEach(c => {
                c.interactions.forEach(int => {
                    const intDate = new Date(int.date);
                    if (isSameDay(intDate, date)) {
                        if (int.type === 'CALL') callCount++;
                        if (int.type === 'EMAIL') emailCount++;
                    }
                });
            });

            data.push({ day: dayLabel, calls: callCount, emails: emailCount });
        }
        return data;
    }, [cases]);

    // Dynamic AI Performance Metrics
    const aiMetrics = useMemo(() => {
        // Consider 'Positive Prediction' as AI Score > 70
        // Consider 'Actual Positive' as Status === 'RESOLVED'

        let truePositives = 0;
        let falsePositives = 0;
        let falseNegatives = 0;

        cases.forEach(c => {
            const isPredictedResolved = (c.aiAnalysis?.recoveryProbability || 0) > 70;
            const isActuallyResolved = c.status === 'RESOLVED';

            if (isPredictedResolved && isActuallyResolved) truePositives++;
            if (isPredictedResolved && !isActuallyResolved) falsePositives++;
            if (!isPredictedResolved && isActuallyResolved) falseNegatives++;
        });

        const precision = truePositives / (truePositives + falsePositives) || 0;
        const recall = truePositives / (truePositives + falseNegatives) || 0;
        const f1 = 2 * ((precision * recall) / (precision + recall)) || 0;

        return {
            precision: (precision * 100).toFixed(1),
            recall: (recall * 100).toFixed(1),
            f1: f1.toFixed(2)
        };
    }, [cases]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Advanced Analytics</h1>
                <p className="text-slate-400">Deep dive into operational metrics and AI effectiveness.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4">Case Status Composition</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ color: '#ffffff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Interaction Volume */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4">Last 7 Days Outreach Intensity</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="day" stroke="#ffffff" tick={{ fill: '#ffffff' }} />
                                <YAxis stroke="#ffffff" tick={{ fill: '#ffffff' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ color: '#ffffff' }} />
                                <Line type="monotone" dataKey="emails" stroke="#8b5cf6" strokeWidth={2} />
                                <Line type="monotone" dataKey="calls" stroke="#06b6d4" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold mb-4">AI Model Performance Audit</h3>
                <p className="text-sm text-slate-400 mb-4">Real-time comparison of predicted recovery (High Probability &gt; 70%) vs actual outcomes (Resolved).</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <p className="text-slate-500 text-xs uppercase">Precision</p>
                        <p className="text-xl font-bold text-white">{aiMetrics.precision}%</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <p className="text-slate-500 text-xs uppercase">Recall</p>
                        <p className="text-xl font-bold text-white">{aiMetrics.recall}%</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <p className="text-slate-500 text-xs uppercase">F1 Score</p>
                        <p className="text-xl font-bold text-white">{aiMetrics.f1}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
