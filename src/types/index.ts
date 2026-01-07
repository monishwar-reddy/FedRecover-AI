export type CaseStatus =
    | 'NEW'
    | 'AI_PROCESSED'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'ESCALATED'
    | 'RESOLVED'
    | 'CLOSED'
    | 'UNRECOVERABLE';

export interface AIAnalysis {
    recoveryProbability: number; // 0-100
    priorityScore: number; // 0-100
    slaBreachRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendedDcaId?: string;
    rationale: string;
}

export interface Case {
    id: string;
    customerName: string;
    amount: number;
    currency: string;
    daysOverdue: number;
    status: CaseStatus;
    assignedDcaId?: string;
    assignedDate?: string;
    interactions: Interaction[];
    aiAnalysis?: AIAnalysis;
    auditLog: AuditLogEntry[];
    createdAt: string;
}

export interface DCA {
    id: string;
    name: string;
    recoveryRate: number; // 0-1
    activeCases: number;
    capacity: number;
    region: string[];
}

export interface Interaction {
    id: string;
    date: string;
    type: 'CALL' | 'EMAIL' | 'LETTER' | 'SMS';
    notes: string;
    outcome?: string;
}

export interface AuditLogEntry {
    timestamp: string;
    action: string;
    actor: string; // 'SYSTEM' | 'USER' | 'AI'
    details: string;
}
