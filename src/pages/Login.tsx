import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Lock, Mail, ArrowRight, UserPlus, Fingerprint, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const Login = () => {
    const navigate = useNavigate();
    const { login, register } = useStore();
    const [isRegister, setIsRegister] = useState(false);

    // Form Inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'DCA_PARTNER'>('ADMIN');

    // UI State
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (isRegister) {
            // Register Flow
            if (password.length < 6) {
                setError("Password must be at least 6 characters.");
                return;
            }
            if (name.length < 2) {
                setError("Name is required.");
                return;
            }

            const success = register({ name, email, password, role });
            if (success) {
                // Auto-redirect since store now logs them in
                if (role === 'DCA_PARTNER') navigate('/portal');
                else navigate('/');
            } else {
                setError("User with this email already exists.");
            }

        } else {
            // Login Flow
            const user = login(email, password);
            if (user) {
                if (user.role === 'DCA_PARTNER') navigate('/portal');
                else navigate('/');
            } else {
                setError("Invalid email or password. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-fedex-purple/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-fedex-orange/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-md relative z-10 p-6 animate-in fade-in zoom-in duration-500">
                <div className="glass-panel p-8 border border-slate-800 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="h-12 w-12 bg-gradient-to-br from-fedex-purple to-fedex-orange rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-fedex-purple/25">
                            <Fingerprint className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
                            {isRegister ? 'Join FedRecover AI' : 'Welcome Back'}
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">
                            {isRegister ? 'Register strictly required for new users.' : 'Secure entry using your unique credentials.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center text-green-500 text-sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required={isRegister}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-fedex-purple"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-fedex-purple transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-fedex-purple transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-fedex-purple transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-fedex-purple transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Only show role selection during Registration */}
                        {isRegister && (
                            <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setRole('ADMIN')}
                                        className={clsx("py-2 text-sm font-medium rounded-md transition-all", role === 'ADMIN' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
                                    >
                                        Admin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('DCA_PARTNER')}
                                        className={clsx("py-2 text-sm font-medium rounded-md transition-all", role === 'DCA_PARTNER' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
                                    >
                                        DCA Partner
                                    </button>
                                </div>
                            </div>
                        )}

                        {isRegister && (
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-fedex-purple to-fedex-purple/80 hover:to-fedex-purple text-white font-bold py-3 rounded-lg shadow-lg shadow-fedex-purple/25 flex items-center justify-center group transition-all mt-6"
                            >
                                Register New Account
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        {/* Quick Demo Login Buttons - Main Portals */}
                        {!isRegister && (
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-fedex-purple to-fedex-purple/80 hover:to-fedex-purple text-white font-bold py-3 rounded-lg shadow-lg shadow-fedex-purple/25 flex items-center justify-center group transition-all mt-6"
                            >
                                Sign In to Portal
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError(null);
                                setSuccess(null);
                            }}
                            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center mx-auto"
                        >
                            {isRegister ? 'Already have an account? Sign In' : 'No account? Create Registration'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-8">
                    &copy; 2026 FedRecover AI. Secured by Serverless Identity.
                </p>
            </div>
        </div>
    );
};
