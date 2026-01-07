import { useState } from 'react';
import { useStore } from '../lib/store';
import { BrainCircuit, AlertCircle, CheckCircle2, Plus, Upload } from 'lucide-react';
import { clsx } from 'clsx';

export const CaseManagement = () => {
    const { cases, ingestCase, runAIAnalysis, autoAllocate, bulkAutoAllocate, importCases } = useStore();
    const [filter, setFilter] = useState('ALL');

    // Filter logic
    const filteredCases = cases.filter(c => {
        if (filter === 'ALL') return true;
        return c.status === filter;
    });

    const handleCreate = () => {
        // Simulate Batch Ingestion of 3-5 cases
        const count = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < count; i++) {
            ingestCase({
                customerName: `New Batch Client ${Math.floor(Math.random() * 10000)}`,
                amount: Math.floor(Math.random() * 75000),
                daysOverdue: Math.floor(Math.random() * 60),
                status: 'NEW'
            });
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csvText = event.target?.result as string;
            // Simple CSV parsing (assuming headers: Customer,Amount,DaysOverdue)
            const lines = csvText.split('\n').slice(1); // Skip header
            const newCases: any[] = [];

            lines.forEach(line => {
                if (!line.trim()) return;
                const [customer, amountStr, daysStr] = line.split(',');
                if (customer && amountStr) {
                    newCases.push({
                        customerName: customer.trim(),
                        amount: parseFloat(amountStr),
                        daysOverdue: parseInt(daysStr) || 30
                    });
                }
            });

            if (newCases.length > 0) {
                importCases(newCases);
                alert(`Successfully imported ${newCases.length} cases.`);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Case Management</h1>
                    <p className="text-slate-400">Monitor and intervene in active recovery workflows.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-1 flex items-center">
                        {['ALL', 'NEW', 'AI_PROCESSED', 'ASSIGNED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                    filter === f ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* NEW: Smart Bulk Allocation Button */}
                    <button
                        onClick={() => {
                            bulkAutoAllocate();
                            // Optional: Alert or Toast can be added here
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-all flex items-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30"
                    >
                        <BrainCircuit className="h-5 w-5 mr-2 animate-pulse" />
                        Smart Allocate Batch
                    </button>

                    {/* Upload Real Data */}
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center border border-slate-600">
                            <Upload className="h-5 w-5 mr-2" />
                            Import CSV
                        </button>
                    </div>

                    <button
                        onClick={handleCreate}
                        className="bg-fedex-purple hover:bg-fedex-purple/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center shadow-lg shadow-fedex-purple/20"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Simulate API Ingest
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 border-b border-slate-700">
                            <tr className="text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">Case Details</th>
                                <th className="p-4 font-medium">Debt Age</th>
                                <th className="p-4 font-medium">Financials</th>
                                <th className="p-4 font-medium">Status & SLA</th>
                                <th className="p-4 font-medium">AI Insights</th>
                                <th className="p-4 font-medium">Allocation</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredCases.map(c => (
                                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-white text-base">{c.customerName}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{c.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <div className={clsx("h-2 w-2 rounded-full mr-2", c.daysOverdue > 90 ? "bg-red-500" : "bg-green-500")} />
                                            <span className="text-slate-300">{c.daysOverdue} Days</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-200 font-mono font-medium">
                                        ${c.amount.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col space-y-2">
                                            <StatusBadge status={c.status} />
                                            {/* SLA Risk Visual */}
                                            {/* SLA Risk Visual - Demo: Show for random high overdue cases */}
                                            {(c.daysOverdue > 30 || c.aiAnalysis?.slaBreachRisk === 'HIGH') && c.status !== 'RESOLVED' && (
                                                <div className="flex items-center text-[10px] font-bold text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/40 w-max mt-1 animate-pulse">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    SLA AT RISK
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {c.aiAnalysis ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-xs text-slate-400">
                                                    <span>Recovery Prob.</span>
                                                    <span className={c.aiAnalysis.recoveryProbability > 70 ? "text-green-400" : "text-orange-400"}>{c.aiAnalysis.recoveryProbability}%</span>
                                                </div>
                                                <div className="h-1.5 w-24 rounded-full bg-slate-800 overflow-hidden">
                                                    <div
                                                        className={clsx("h-full rounded-full", c.aiAnalysis.recoveryProbability > 70 ? "bg-green-500" : "bg-orange-500")}
                                                        style={{ width: `${c.aiAnalysis.recoveryProbability}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-xs italic flex items-center">
                                                <BrainCircuit className="h-3 w-3 mr-1" />
                                                Pending Analysis
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {c.assignedDcaId ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                                                    {c.assignedDcaId.substring(4, 6)}
                                                </div>
                                                <span className="text-sm text-slate-300">{c.assignedDcaId}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-xs">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {c.status === 'NEW' && (
                                            <button
                                                onClick={() => runAIAnalysis(c.id)}
                                                className="text-accent-500 hover:text-white hover:bg-accent-600 px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center transition-all bg-accent-500/10 border border-accent-500/20"
                                            >
                                                <BrainCircuit className="h-3 w-3 mr-1.5" />
                                                Run AI
                                            </button>
                                        )}
                                        {c.status === 'AI_PROCESSED' && (
                                            <button
                                                onClick={() => autoAllocate(c.id)}
                                                className="text-fedex-orange hover:text-white hover:bg-fedex-orange px-3 py-1.5 rounded-md text-xs font-medium inline-flex items-center transition-all bg-fedex-orange/10 border border-fedex-orange/20"
                                            >
                                                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                                Allocate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredCases.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-500">
                                        No cases found with this status.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        'NEW': 'bg-slate-800 text-slate-400 border-slate-700',
        'AI_PROCESSED': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'ASSIGNED': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'IN_PROGRESS': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'RESOLVED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'CLOSED': 'bg-slate-800 text-slate-500 border-slate-700',
    } as any;

    return (
        <span className={clsx("px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border", styles[status] || styles['NEW'])}>
            {status.replace('_', ' ')}
        </span>
    );
}
