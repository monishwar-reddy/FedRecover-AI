import { useState } from 'react';
import { Shield, Database, Save, RotateCcw } from 'lucide-react';

export const AdminPanel = () => {
    const [saved, setSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRetraining, setIsRetraining] = useState(false);
    const [retrainSuccess, setRetrainSuccess] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    const handleRetrain = () => {
        setIsRetraining(true);
        setRetrainSuccess(false);
        // Simulate AI Training
        setTimeout(() => {
            setIsRetraining(false);
            setRetrainSuccess(true);
            setTimeout(() => setRetrainSuccess(false), 3000);
        }, 2500);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Administration & SOPs</h1>
                <p className="text-slate-400">Configure global rules, AI thresholds, and system preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SOP Configuration */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <div className="flex items-center mb-6">
                        <Shield className="h-5 w-5 mr-2 text-fedex-purple" />
                        <h3 className="text-lg font-bold">Standard Operating Procedures (SOPs)</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 font-medium">SLA: Initial Acknowledgment</label>
                                <div className="flex items-center space-x-2">
                                    <input type="number" defaultValue={24} className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white w-24 focus:outline-none focus:border-fedex-purple transition-colors" />
                                    <span className="text-slate-500 text-sm">Hours</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 font-medium">SLA: First Action Required</label>
                                <div className="flex items-center space-x-2">
                                    <input type="number" defaultValue={7} className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white w-24 focus:outline-none focus:border-fedex-purple transition-colors" />
                                    <span className="text-slate-500 text-sm">Days</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 font-medium">Auto-Escalation Threshold</label>
                                <div className="flex items-center space-x-2">
                                    <input type="number" defaultValue={30} className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white w-24 focus:outline-none focus:border-fedex-purple transition-colors" />
                                    <span className="text-slate-500 text-sm">Days without movement</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 font-medium">Min. Debt for Manual Review</label>
                                <div className="flex items-center space-x-2">
                                    <span className="text-slate-500 text-sm">$</span>
                                    <input type="number" defaultValue={50000} className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white w-32 focus:outline-none focus:border-fedex-purple transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700/50">
                            <div className="flex items-start space-x-3">
                                <input type="checkbox" defaultChecked className="mt-1 bg-slate-900 border-slate-700 rounded text-fedex-purple focus:ring-fedex-purple" />
                                <div>
                                    <p className="text-sm font-medium text-white">Require PTP (Promise to Pay) Validation</p>
                                    <p className="text-xs text-slate-500">If checked, agents must upload proof when marking a PTP status.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Tuning */}
                <div className="glass-panel p-6">
                    <div className="flex items-center mb-6">
                        <Database className="h-5 w-5 mr-2 text-fedex-orange" />
                        <h3 className="text-lg font-bold">AI Model Tuning</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400 font-medium flex justify-between">
                                <span>Risk Tolerance</span>
                                <span>Conservative</span>
                            </label>
                            <input type="range" className="w-full accent-fedex-orange cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400 font-medium flex justify-between">
                                <span>Allocation Aggression</span>
                                <span>Balanced</span>
                            </label>
                            <input type="range" className="w-full accent-fedex-purple cursor-pointer" />
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mt-6">
                            <p className="text-xs font-mono text-slate-500 mb-2">Model Version: v3.4.1 (Latest)</p>
                            <button
                                onClick={handleRetrain}
                                disabled={isRetraining}
                                className={`w-full text-xs py-2 rounded border transition-all flex items-center justify-center ${retrainSuccess ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600'}`}
                            >
                                <RotateCcw className={`h-3 w-3 mr-2 ${isRetraining ? 'animate-spin' : ''}`} />
                                {isRetraining ? 'Retraining Model...' : retrainSuccess ? 'Training Complete!' : 'Retrain on New Data'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving || saved}
                    className={`px-6 py-2 rounded-lg font-bold shadow-lg flex items-center transition-all ${saved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-fedex-purple hover:bg-fedex-purple/90 text-white'}`}
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : saved ? 'Configuration Saved!' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
};
