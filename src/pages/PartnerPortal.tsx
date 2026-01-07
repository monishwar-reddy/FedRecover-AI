import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { ClipboardList, Clock, CheckCircle, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export const PartnerPortal = () => {
    const { cases, updateStatus, currentUser } = useStore();
    const [searchQuery, setSearchQuery] = useState('');

    // Mock logged in logic: match assignedDcaId to what we assume is the partner's ID
    // In a real app, currentUser would have a 'dcaId' field. For demo:
    const partnerId = 'dca-001'; // Defaulting to SwiftRecover for demo continuity

    const myCases = useMemo(() => {
        let list = cases.filter(c => c.assignedDcaId === partnerId);
        if (searchQuery) {
            const low = searchQuery.toLowerCase();
            list = list.filter(c =>
                c.id.toLowerCase().includes(low) ||
                c.customerName.toLowerCase().includes(low)
            );
        }
        return list;
    }, [cases, searchQuery]);

    const metrics = useMemo(() => {
        return {
            pending: myCases.filter(c => c.status === 'ASSIGNED').length,
            active: myCases.filter(c => c.status === 'IN_PROGRESS').length,
            resolved: myCases.filter(c => c.status === 'RESOLVED').length,
            rate: myCases.length > 0 ? (myCases.filter(c => c.status === 'RESOLVED').length / myCases.length * 100).toFixed(1) : 0
        }
    }, [myCases]);

    const handleDownload = () => {
        const headers = ['Case ID', 'Customer', 'Assigned Date', 'Debt Value', 'Status'];
        const rows = myCases.map(c => [
            c.id,
            c.customerName,
            c.assignedDate ? format(new Date(c.assignedDate), 'yyyy-MM-dd') : '',
            c.amount,
            c.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `partner_cases_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Portal Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {(currentUser?.name || "SR").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-slate-900 leading-tight">{currentUser?.name || "Partner Portal"}</h1>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Authorized Collection Partner</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
                            <Search className="h-4 w-4 text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search Case ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-sm focus:outline-none w-48 text-slate-600"
                            />
                        </div>
                        <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-700">{currentUser?.name || 'Partner User'}</p>
                                <p className="text-xs text-slate-500">Collection Agent</p>
                            </div>
                            <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                <User className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <KPI tile="New Assignments" value={metrics.pending} icon={ClipboardList} color="blue" />
                    <KPI tile="In Progress" value={metrics.active} icon={Clock} color="orange" />
                    <KPI tile="Resolved (MTD)" value={metrics.resolved} icon={CheckCircle} color="emerald" />
                    <KPI tile="Success Rate" value={`${metrics.rate}%`} icon={CheckCircle} color="indigo" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Assigned Case List</h2>
                        <button onClick={handleDownload} className="text-sm text-blue-600 font-medium hover:underline">Download CSV</button>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Case ID</th>
                                <th className="px-6 py-3">Customer Entity</th>
                                <th className="px-6 py-3">Assigned Date</th>
                                <th className="px-6 py-3">Debt Value</th>
                                <th className="px-6 py-3">SLA Status</th>
                                <th className="px-6 py-3">Current Status</th>
                                <th className="px-6 py-3 text-right">Perform Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myCases.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                                        No cases found for "{searchQuery}"
                                    </td>
                                </tr>
                            ) : (
                                myCases.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{c.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{c.customerName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {c.assignedDate ? format(new Date(c.assignedDate), 'MMM dd') : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">${c.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {c.status === 'ASSIGNED' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Action Req.
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">On Track</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-xs font-bold border",
                                                c.status === 'IN_PROGRESS' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                    c.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                        "bg-slate-100 text-slate-600 border-slate-200"
                                            )}>
                                                {c.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {c.status === 'ASSIGNED' && (
                                                <button
                                                    onClick={() => updateStatus(c.id, 'IN_PROGRESS', 'DCA started work')}
                                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow-sm font-medium transition-colors"
                                                >
                                                    Start Work
                                                </button>
                                            )}
                                            {c.status === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={() => updateStatus(c.id, 'RESOLVED', 'Payment Received')}
                                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded shadow-sm font-medium transition-colors"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                            {c.status === 'RESOLVED' && (
                                                <span className="text-xs text-slate-400 italic">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

const KPI = ({ tile, value, icon: Icon, color }: any) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600",
        emerald: "bg-emerald-50 text-emerald-600",
        indigo: "bg-indigo-50 text-indigo-600",
    } as any;

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${colors[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{tile}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    )
}

