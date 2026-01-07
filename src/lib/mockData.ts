import { Case, DCA } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const MOCK_DCAS: DCA[] = [
    {
        id: 'dca-001',
        name: 'SwiftRecover Global',
        recoveryRate: 0.82,
        activeCases: 145,
        capacity: 200,
        region: ['NA', 'EU']
    },
    {
        id: 'dca-002',
        name: 'Apex Collections',
        recoveryRate: 0.76,
        activeCases: 89,
        capacity: 150,
        region: ['APAC']
    },
    {
        id: 'dca-003',
        name: 'FedEx Internal Ops',
        recoveryRate: 0.91,
        activeCases: 30,
        capacity: 100,
        region: ['GLOBAL']
    },
    {
        id: 'dca-004',
        name: 'Stratton Oakmont Recovery',
        recoveryRate: 0.65,
        activeCases: 210,
        capacity: 500,
        region: ['NA']
    },
    {
        id: 'dca-005',
        name: 'Prestige Worldwide',
        recoveryRate: 0.88,
        activeCases: 45,
        capacity: 80,
        region: ['EU']
    }
];

const COMPANY_NAMES = [
    "Acme Logistics", "Globex Corp", "Soylent Corp", "Initech", "Umbrella Corp",
    "Stark Industries", "Wayne Enterprises", "Cyberdyne Systems", "Massive Dynamic",
    "Hooli", "Vehement Capital", "Prestige Worldwide", "Dunder Mifflin",
    "Aperture Science", "Black Mesa", "Tyrell Corp", "Yoyodyne", "Virtucon",
    "Nakatomi Trading", "LexCorp", "Oscorp", "Roxxon Energy", "Sayre & Co"
];

const generateMockCases = (count: number): Case[] => {
    const cases: Case[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const isResolved = Math.random() > 0.7; // 30% resolved
        const isNew = Math.random() > 0.8; // 20% completely new
        const amount = Math.floor(Math.random() * 100000) + 500;
        const daysOverdue = Math.floor(Math.random() * 180) + 1;

        let status: any = 'NEW';
        let assignedDcaId = undefined;
        let aiAnalysis = undefined;
        let interactions: any[] = [];

        // 1. Generate Smart AI Scores based on Status (Fixing the "Accuracy too low" issue)
        let recoveryProb = Math.floor(Math.random() * 100);

        if (isResolved) {
            status = 'RESOLVED';
            // If resolved, force a high probability to simulate "Correct Prediction"
            recoveryProb = Math.floor(Math.random() * 20) + 80; // 80-99
            assignedDcaId = MOCK_DCAS[Math.floor(Math.random() * MOCK_DCAS.length)].id;
        } else if (!isNew) {
            status = Math.random() > 0.5 ? 'IN_PROGRESS' : 'ASSIGNED';
            assignedDcaId = MOCK_DCAS[Math.floor(Math.random() * MOCK_DCAS.length)].id;
            // If not resolved, lower random probability to simulate "Correct Non-Prediction"
            recoveryProb = Math.floor(Math.random() * 80); // 0-79
        }

        // 2. Generate Recent Interactions (Fixing the "Graph not responding" issue)
        // Ensure some cases have interactions in the last 7 days
        if (status !== 'NEW' && Math.random() > 0.3) {
            const numInteractions = Math.floor(Math.random() * 5) + 1;
            for (let k = 0; k < numInteractions; k++) {
                const dayOffset = Math.floor(Math.random() * 7); // 0-6 days ago
                const intDate = new Date(now);
                intDate.setDate(now.getDate() - dayOffset);

                interactions.push({
                    id: uuidv4(),
                    date: intDate.toISOString(),
                    type: Math.random() > 0.5 ? 'CALL' : 'EMAIL',
                    notes: 'Automated follow-up logged.'
                });
            }
        }

        if (status !== 'NEW') {
            aiAnalysis = {
                recoveryProbability: recoveryProb,
                priorityScore: Math.floor(Math.random() * 100),
                slaBreachRisk: Math.random() > 0.8 ? 'HIGH' : 'LOW',
                recommendedDcaId: assignedDcaId || MOCK_DCAS[0].id,
                rationale: 'Historical payment patterns and recent credit updates.'
            };
        }

        cases.push({
            id: `CASE-2024-${1000 + i}`,
            customerName: COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)] + " " + (i + 1),
            amount,
            currency: 'USD',
            daysOverdue,
            status,
            assignedDcaId,
            assignedDate: !isNew ? new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString() : undefined,
            interactions,
            auditLog: [],
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 15000000000)).toISOString(),
            aiAnalysis: aiAnalysis as any
        });
    }
    return cases;
};

// Generate 150 cases
export const MOCK_CASES: Case[] = generateMockCases(150);
