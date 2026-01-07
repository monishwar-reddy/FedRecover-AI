
import { Sidebar } from './Sidebar';
import { Search, UserCircle } from 'lucide-react';
import { useStore } from '../lib/store';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const { currentUser } = useStore();
    return (
        <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search cases, DCAs..."
                            className="bg-slate-900 border border-slate-700 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-fedex-purple w-64 transition-all"
                        />
                    </div>

                    <div className="flex items-center space-x-4">

                        <div className="flex items-center space-x-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{currentUser?.name || 'Guest User'}</p>
                                <p className="text-xs text-slate-400">{currentUser?.role === 'ADMIN' ? 'FedEx Recovery Ops' : 'DCA Partner'}</p>
                            </div>
                            <UserCircle className="h-8 w-8 text-slate-400" />
                        </div>
                    </div>
                </header>
                {/* Content Area */}
                <main className="flex-1 overflow-auto p-8 relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                    <div className="relative z-10 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
