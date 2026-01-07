
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, PieChart, ShieldCheck, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../lib/store';

export const Sidebar = () => {
    const { logout } = useStore();
    const links = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/cases', icon: Briefcase, label: 'Case Management' },
        { to: '/analytics', icon: PieChart, label: 'Analytics' },
        { to: '/admin', icon: ShieldCheck, label: 'Admin & SOPs' },
    ];

    return (
        <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col p-4">
            <div className="mb-8 flex items-center space-x-2 px-2">
                <div className="h-8 w-8 bg-gradient-to-br from-fedex-purple to-fedex-orange rounded-lg" />
                <span className="text-xl font-display font-bold text-white tracking-tight">FedRecover AI</span>
            </div>

            <nav className="flex-1 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => clsx(
                            "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                            isActive
                                ? "bg-gradient-to-r from-fedex-purple/20 to-transparent text-white border-l-2 border-fedex-purple"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                        )}
                    >
                        <link.icon className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                        <span className="font-medium text-sm">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto px-2 mb-4">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 w-full transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>

            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 text-xs text-slate-500">
                <p>Serverless v2.4.0</p>
                <p>Connected: us-east-1</p>
            </div>
        </div>
    );
};
