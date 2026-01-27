import type { PlayerGameStats, BattingStats, PitchingStats, FieldingStats, PerformanceLevel } from '../types';

// Parse IP from input format (4.1, 4.2) to actual innings
export function parseIP(input: number): number {
    const str = input.toString();
    const [innings, outs] = str.split('.');
    return parseInt(innings) + (parseInt(outs || '0') / 3);
}

// Format IP back to display format
export function formatIP(decimalIP: number): string {
    const innings = Math.floor(decimalIP);
    const fraction = decimalIP - innings;
    const outs = Math.round(fraction * 3);
    return outs > 0 ? `${innings}.${outs}` : `${innings}.0`;
}

// Safe division helper
function safeDivide(num: number, denom: number, fallback: number = 0): number {
    return denom === 0 ? fallback : num / denom;
}

// Calculate batting stats from raw input
export function calcBatting(stats: PlayerGameStats | PlayerGameStats[]): BattingStats {
    const arr = Array.isArray(stats) ? stats : [stats];

    const ab = arr.reduce((s, g) => s + g.ab, 0);
    const h = arr.reduce((s, g) => s + g.h, 0);
    const doubles = arr.reduce((s, g) => s + g.doubles, 0);
    const triples = arr.reduce((s, g) => s + g.triples, 0);
    const hr = arr.reduce((s, g) => s + g.hr, 0);
    const bb = arr.reduce((s, g) => s + g.bb, 0);
    const so = arr.reduce((s, g) => s + g.so, 0);
    const hbp = arr.reduce((s, g) => s + g.hbp, 0);
    const sb = arr.reduce((s, g) => s + g.sb, 0);
    const cs = arr.reduce((s, g) => s + g.cs, 0);
    const sac = arr.reduce((s, g) => s + g.sac, 0);
    const sf = arr.reduce((s, g) => s + g.sf, 0);

    const pa = ab + bb + hbp + sf + sac;
    const singles = h - doubles - triples - hr;
    const tb = singles + (2 * doubles) + (3 * triples) + (4 * hr);
    const avg = safeDivide(h, ab);
    const slg = safeDivide(tb, ab);
    const obp = safeDivide(h + bb + hbp, ab + bb + hbp + sf);
    const ops = obp + slg;
    const iso = slg - avg;
    const bbPct = safeDivide(bb, pa);
    const kPct = safeDivide(so, pa);
    const sbPct = safeDivide(sb, sb + cs);
    const babip = safeDivide(h - hr, ab - so - hr + sf);
    const xbh = doubles + triples + hr;

    return { pa, avg, singles, tb, slg, obp, ops, iso, bbPct, kPct, sbPct, babip, xbh };
}

// Calculate pitching stats from raw input
export function calcPitching(stats: PlayerGameStats | PlayerGameStats[]): PitchingStats {
    const arr = Array.isArray(stats) ? stats : [stats];

    const ipRaw = arr.reduce((s, g) => s + parseIP(g.ip), 0);
    const h = arr.reduce((s, g) => s + g.pH, 0);
    const er = arr.reduce((s, g) => s + g.er, 0);
    const bb = arr.reduce((s, g) => s + g.pBB, 0);
    const so = arr.reduce((s, g) => s + g.pSO, 0);
    const pitchCount = arr.reduce((s, g) => s + g.pitchCount, 0);
    const bf = arr.reduce((sum, g) => sum + g.ab + g.pBB + g.hbp, 0); // Rough BF approximation

    // ERA = (ER × 7) / IP - SOFTBALL uses 7 innings!
    const era = safeDivide(er * 7, ipRaw);
    const whip = safeDivide(bb + h, ipRaw);
    const kBB = safeDivide(so, bb);
    const oba = safeDivide(h, bf || 1);
    const pitchesPerIP = safeDivide(pitchCount, ipRaw);

    return { era, whip, kBB, oba, pitchesPerIP };
}

// Calculate fielding stats from raw input
export function calcFielding(stats: PlayerGameStats | PlayerGameStats[]): FieldingStats {
    const arr = Array.isArray(stats) ? stats : [stats];

    const po = arr.reduce((s, g) => s + g.po, 0);
    const a = arr.reduce((s, g) => s + g.a, 0);
    const e = arr.reduce((s, g) => s + g.e, 0);
    const cs = arr.reduce((s, g) => s + (g.cCS || 0), 0);
    const sb = arr.reduce((s, g) => s + (g.cSB || 0), 0);

    const fldPct = safeDivide(po + a, po + a + e);
    const csPct = safeDivide(cs, cs + sb);

    return { fldPct, csPct };
}

// Format stat for display with raw numbers
export function formatAvg(val: number, hits?: number, ab?: number): string {
    const formatted = val.toFixed(3).replace(/^0/, '');
    if (hits !== undefined && ab !== undefined) {
        return `${formatted} (${hits}/${ab})`;
    }
    return formatted;
}

export function formatPct(val: number): string {
    return val.toFixed(3).replace(/^0/, '');
}

export function formatERA(val: number): string {
    return val.toFixed(2);
}

export function formatWHIP(val: number): string {
    return val.toFixed(2);
}

// Color coding thresholds
export function getAvgLevel(avg: number): PerformanceLevel {
    if (avg >= 0.300) return 'good';
    if (avg >= 0.250) return 'average';
    return 'poor';
}

export function getERALevel(era: number): PerformanceLevel {
    if (era < 3.00) return 'good';
    if (era <= 4.00) return 'average';
    return 'poor';
}

export function getFldLevel(fldPct: number): PerformanceLevel {
    if (fldPct >= 0.975) return 'good';
    if (fldPct >= 0.950) return 'average';
    return 'poor';
}

export function getOBPLevel(obp: number): PerformanceLevel {
    if (obp >= 0.400) return 'good';
    if (obp >= 0.330) return 'average';
    return 'poor';
}

export function getSLGLevel(slg: number): PerformanceLevel {
    if (slg >= 0.500) return 'good';
    if (slg >= 0.400) return 'average';
    return 'poor';
}

export function getOPSLevel(ops: number): PerformanceLevel {
    if (ops >= 0.850) return 'good';
    if (ops >= 0.700) return 'average';
    return 'poor';
}
