/**
 * Game-Play Logical Validator
 */

export interface GameValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateLegalGame(
    runsHome: number,
    runsVisitor: number,
    inningsHomeBattingOuts: number,
    inningsVisitorBattingOuts: number
): GameValidationResult {
    // 1. Home team winning logically
    if (runsHome > runsVisitor) {
        if (inningsHomeBattingOuts > inningsVisitorBattingOuts) {
            return {
                isValid: false,
                error: "Winning home team cannot have more innings at bat than the visitor."
            };
        }
    }

    // 2. Home team losing logically
    if (runsHome < runsVisitor) {
        if (inningsHomeBattingOuts !== inningsVisitorBattingOuts) {
            return {
                isValid: false,
                error: "Losing home team must complete their final half-inning."
            };
        }
    }

    return { isValid: true };
}
