import { Case, DCA, AIAnalysis } from "../types";

export const calculateRecoveryScore = (c: Case): number => {
    // Mock logic: Younger debt = higher chance.
    let score = 100 - (c.daysOverdue * 0.5);
    if (c.amount > 50000) score += 10; // High value often prioritized
    return Math.max(0, Math.min(100, Math.floor(score)));
}

export const calculatePriority = (c: Case): number => {
    // Amount carries heavy weight
    const amountWeight = Math.min(50, c.amount / 1000);
    const ageWeight = Math.min(50, c.daysOverdue / 2);
    return Math.floor(amountWeight + ageWeight);
}

export const analyzeCase = (c: Case, dcas: DCA[]): AIAnalysis => {
    const recScore = calculateRecoveryScore(c);
    const prioScore = calculatePriority(c);

    // Find best DCA
    const bestDca = dcas.reduce((prev, current) => {
        return (prev.recoveryRate > current.recoveryRate) ? prev : current; // Simple logic
    });

    return {
        recoveryProbability: recScore,
        priorityScore: prioScore,
        slaBreachRisk: recScore < 50 ? 'HIGH' : 'LOW',
        recommendedDcaId: bestDca.id,
        rationale: `AI Score ${recScore}% based on ${c.daysOverdue} days overdue. Matched to ${bestDca.name} for efficiency.`
    };
}
