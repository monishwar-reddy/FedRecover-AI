import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Case, DCA, CaseStatus } from '../types';
import { MOCK_CASES, MOCK_DCAS } from './mockData';
import { analyzeCase } from './ai';

interface UserSession {
    name: string;
    email: string;
    role: 'ADMIN' | 'DCA_PARTNER';
    password?: string; // In a real app, this would be hashed. Demo only.
}

interface AppState {
    cases: Case[];
    dcas: DCA[];
    currentUser: UserSession | null;
    registeredUsers: UserSession[];

    // Actions
    login: (email: string, password: string) => UserSession | null;
    logout: () => void;
    register: (user: UserSession) => boolean;

    ingestCase: (newCase: Partial<Case>) => void;
    importCases: (newCases: Partial<Case>[]) => void;
    runAIAnalysis: (caseId: string) => void;
    manualAllocate: (caseId: string, dcaId: string) => void;
    autoAllocate: (caseId: string) => void;
    bulkAutoAllocate: () => void;
    updateStatus: (caseId: string, status: CaseStatus, note?: string) => void;
    addInteraction: (caseId: string, type: 'CALL' | 'EMAIL' | 'SMS' | 'LETTER', notes: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            cases: MOCK_CASES,
            dcas: MOCK_DCAS,
            currentUser: null,
            registeredUsers: [
                // Default Admin for demo purposes so they aren't locked out initially
                { name: 'Monishwar Reddy', email: 'admin@fedex.com', role: 'ADMIN', password: 'password123' },
                // Default Partner for demo
                { name: 'SwiftRecover Agency', email: 'partner@demo.com', role: 'DCA_PARTNER', password: 'password123' }
            ],

            login: (email, password) => {
                const user = get().registeredUsers.find(u => u.email === email && u.password === password);
                if (user) {
                    set({ currentUser: user });
                    return user;
                }
                return null;
            },

            logout: () => set({ currentUser: null }),

            register: (newUser) => {
                const exists = get().registeredUsers.some(u => u.email === newUser.email);
                if (exists) return false;

                set(state => ({
                    registeredUsers: [...state.registeredUsers, newUser],
                    currentUser: newUser // Auto-login
                }));
                return true;
            },

            ingestCase: (newCase) => set((state) => {
                const c: Case = {
                    id: `CASE-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    status: 'NEW',
                    amount: 0,
                    currency: 'USD',
                    customerName: 'Unknown',
                    daysOverdue: 0,
                    interactions: [],
                    auditLog: [{
                        timestamp: new Date().toISOString(),
                        action: 'CREATED',
                        actor: 'SYSTEM',
                        details: 'Case ingested via API'
                    }],
                    ...newCase
                } as Case;
                return { cases: [c, ...state.cases] };
            }),

            importCases: (newCases) => set((state) => {
                const timestamp = new Date().toISOString();
                const formattedCases = newCases.map((nc, idx) => ({
                    id: `CASE-IMP-${Date.now()}-${idx}`,
                    createdAt: timestamp,
                    status: 'NEW',
                    amount: 0,
                    currency: 'USD',
                    customerName: 'Unknown',
                    daysOverdue: 0,
                    interactions: [],
                    auditLog: [{
                        timestamp,
                        action: 'CREATED',
                        actor: 'SYSTEM',
                        details: 'Bulk Imported via CSV'
                    }],
                    ...nc
                } as Case));

                return { cases: [...formattedCases, ...state.cases] };
            }),

            runAIAnalysis: (caseId) => set((state) => ({
                cases: state.cases.map(c => {
                    if (c.id !== caseId) return c;
                    const analysis = analyzeCase(c, state.dcas);
                    return {
                        ...c,
                        status: 'AI_PROCESSED',
                        aiAnalysis: analysis,
                        auditLog: [...c.auditLog, {
                            timestamp: new Date().toISOString(),
                            action: 'AI_SCORING',
                            actor: 'AI_ENGINE',
                            details: `Processed. Score: ${analysis.recoveryProbability}`
                        }]
                    };
                })
            })),

            manualAllocate: (caseId, dcaId) => set((state) => ({
                cases: state.cases.map(c => {
                    if (c.id !== caseId) return c;
                    return {
                        ...c,
                        assignedDcaId: dcaId,
                        assignedDate: new Date().toISOString(),
                        status: 'ASSIGNED',
                        auditLog: [...c.auditLog, {
                            timestamp: new Date().toISOString(),
                            action: 'ALLOCATED_MANUAL',
                            actor: 'ADMIN',
                            details: `Assigned to DCA ${dcaId}`
                        }]
                    }
                })
            })),

            autoAllocate: (caseId) => set((state) => {
                // Finds best DCA from AI Analysis
                const c = state.cases.find(x => x.id === caseId);
                // Simple logic: if AI recommended one, use it. Else pick highest recovery rate DCA.
                let targetDcaId = c?.aiAnalysis?.recommendedDcaId;

                if (!targetDcaId) {
                    // Fallback smart logic: Pick DCA with best recovery rate
                    const sortedDcas = [...state.dcas].sort((a, b) => b.recoveryRate - a.recoveryRate);
                    targetDcaId = sortedDcas[0].id;
                }

                if (!c) return {};

                return {
                    cases: state.cases.map(curr => {
                        if (curr.id !== caseId) return curr;
                        return {
                            ...curr,
                            assignedDcaId: targetDcaId,
                            assignedDate: new Date().toISOString(),
                            status: 'ASSIGNED',
                            auditLog: [...curr.auditLog, {
                                timestamp: new Date().toISOString(),
                                actor: 'ABOT_ALLOCATOR',
                                action: 'ALLOCATED_AUTO',
                                details: `Smart-assigned to ${targetDcaId} (Best Match).`
                            }]
                        }
                    })
                }
            }),

            // NEW: Bulk Smart Allocation for "Hackathon Wow Factor"
            bulkAutoAllocate: () => set((state) => {
                const unassigned = state.cases.filter(c => c.status === 'NEW' || c.status === 'AI_PROCESSED');
                if (unassigned.length === 0) return {};

                const updatedCases = state.cases.map(c => {
                    // Only touch unassigned cases
                    if (c.status !== 'NEW' && c.status !== 'AI_PROCESSED') return c;

                    // 1. Determine Strategy
                    // High Value (> $50k) -> Goes to 'Strategic' DCA (Highest Rate)
                    // Low Value -> Goes to 'Volume' DCA (Highest Capacity)
                    const isHighValue = c.amount > 50000;

                    let bestDca = state.dcas[0];
                    if (isHighValue) {
                        // Find highest recovery rate
                        bestDca = state.dcas.reduce((prev, curr) => (prev.recoveryRate > curr.recoveryRate) ? prev : curr);
                    } else {
                        // Find highest capacity
                        bestDca = state.dcas.reduce((prev, curr) => (prev.capacity > curr.capacity) ? prev : curr);
                    }

                    return {
                        ...c,
                        assignedDcaId: bestDca.id,
                        assignedDate: new Date().toISOString(),
                        status: 'ASSIGNED' as CaseStatus,
                        auditLog: [...c.auditLog, {
                            timestamp: new Date().toISOString(),
                            actor: 'AI_OPTIMIZER',
                            action: 'BULK_ALLOCATION',
                            details: `Segment: ${isHighValue ? 'High Value' : 'Standard'}. Matched to top performer: ${bestDca.name}`
                        }]
                    };
                });

                return { cases: updatedCases };
            }),

            updateStatus: (caseId, status, note) => set(state => ({
                cases: state.cases.map(c => {
                    if (c.id !== caseId) return c;
                    return {
                        ...c,
                        status,
                        auditLog: [...c.auditLog, {
                            timestamp: new Date().toISOString(),
                            actor: 'DCA_USER',
                            action: 'STATUS_UPDATE',
                            details: `Changed to ${status}. Note: ${note || ''}`
                        }]
                    }
                })
            })),

            addInteraction: (caseId, type, notes) => set(state => ({
                cases: state.cases.map(c => {
                    if (c.id !== caseId) return c;
                    return {
                        ...c,
                        interactions: [...c.interactions, {
                            id: Math.random().toString(36),
                            date: new Date().toISOString(),
                            type,
                            notes
                        }],
                        auditLog: [...c.auditLog, {
                            timestamp: new Date().toISOString(),
                            actor: 'DCA_USER',
                            action: 'INTERACTION_LOG',
                            details: `${type}: ${notes}`
                        }]
                    }
                })
            }))
        }),
        {
            name: 'fedrecover-storage-v3', // unique name
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({ registeredUsers: state.registeredUsers }), // Only persist users, let mock cases reset or persist too if desired. Let's persist users.
        }
    )
);
