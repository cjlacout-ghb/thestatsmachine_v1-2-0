/**
 * Sports Logic Utilities
 * Specialized handling for diamond sports (Softball/Baseball)
 */

/**
 * Converts innings in X.1/X.2 format to total outs
 * 7.0 -> 21
 * 7.1 -> 22
 * 7.2 -> 23
 */
export function inningsToOuts(innings: number): number {
    const whole = Math.floor(innings);
    const fraction = Math.round((innings - whole) * 10);
    return (whole * 3) + fraction;
}

/**
 * Converts total outs back to X.1/X.2 format
 * 21 -> 7.0
 * 22 -> 7.1
 * 23 -> 7.2
 */
export function outsToInnings(outs: number): number {
    const whole = Math.floor(outs / 3);
    const remainder = outs % 3;
    return whole + (remainder / 10);
}

/**
 * Formats innings for display
 */
export function formatInnings(innings: number | undefined): string {
    if (innings === undefined) return '0.0';
    return innings.toFixed(1);
}

/**
 * Validates innings format (X.0, X.1, X.2)
 */
export function isValidInnings(innings: number): boolean {
    const fraction = Math.round((innings - Math.floor(innings)) * 10);
    return fraction >= 0 && fraction <= 2;
}

/**
 * Standardizes a number into a valid inning format if it has a .3 remainder
 * e.g. 5.3 becomes 6.0
 */
export function normalizeInnings(innings: number): number {
    const totalOuts = inningsToOuts(innings);
    return outsToInnings(totalOuts);
}
