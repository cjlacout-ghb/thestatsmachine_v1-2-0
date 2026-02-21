/**
 * Inning Conversion Logic (Standard X.1/X.2 Format)
 */

export function inningsToOuts(innings: string | number): number {
    const value = typeof innings === 'string' ? parseFloat(innings) : innings;
    if (isNaN(value) || value < 0) return 0;

    const whole = Math.floor(value);
    const decimal = value - whole;
    // .1 = 1 out, .2 = 2 outs
    const outs = Math.round(decimal * 10);

    return (whole * 3) + outs;
}

export function outsToInnings(outs: number): number {
    if (outs <= 0) return 0;
    const whole = Math.floor(outs / 3);
    const remainder = outs % 3;
    // Returns number in X.1/X.2 format
    return whole + (remainder * 0.1);
}

export function validateInningsString(val: string): boolean {
    return /^(\d+)(\.([12]))?$/.test(val);
}
