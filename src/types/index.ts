// Core types for Softball Stats Tracker

export type Position = 'P' | 'C' | '1B' | '2B' | '3B' | 'SS' | 'LF' | 'CF' | 'RF' | 'DP' | 'FLEX';

export interface Tournament {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    type: 'league' | 'tournament' | 'friendly';
}

export interface Player {
    id: string;
    name: string;
    jerseyNumber: string;
    primaryPosition: Position;
    secondaryPositions: Position[];
    tournamentId: string;
}

export interface Game {
    id: string;
    tournamentId: string;
    date: string;
    opponent: string;
    homeAway: 'home' | 'away';
    gameType: 'regular' | 'playoff' | 'championship' | 'friendly';
    teamScore: number;
    opponentScore: number;
    playerStats: PlayerGameStats[];
}

export interface PlayerGameStats {
    playerId: string;
    // Batting (input)
    ab: number;
    h: number;
    doubles: number;
    triples: number;
    hr: number;
    rbi: number;
    r: number;
    bb: number;
    so: number;
    hbp: number;
    sb: number;
    cs: number;
    sac: number;
    sf: number;
    // Pitching (input)
    ip: number; // Stored as decimal (4.1 = 4⅓)
    pH: number; // Hits allowed
    pR: number; // Runs allowed
    er: number;
    pBB: number;
    pSO: number;
    pHR: number;
    pitchCount: number;
    // Fielding (input)
    po: number;
    a: number;
    e: number;
    // Catcher-specific (optional)
    cCS?: number;
    cSB?: number;
    pk?: number;
    pb?: number;
}

// Calculated stats
export interface BattingStats {
    pa: number;
    avg: number;
    singles: number;
    tb: number;
    slg: number;
    obp: number;
    ops: number;
    iso: number;
    bbPct: number;
    kPct: number;
    sbPct: number;
    babip: number;
    xbh: number;
}

export interface PitchingStats {
    era: number;
    whip: number;
    kBB: number;
    oba: number;
    pitchesPerIP: number;
}

export interface FieldingStats {
    fldPct: number;
    csPct: number;
}

// Color coding threshold types
export type PerformanceLevel = 'good' | 'average' | 'poor';

// App state
export interface AppData {
    tournaments: Tournament[];
    players: Player[];
    games: Game[];
}
