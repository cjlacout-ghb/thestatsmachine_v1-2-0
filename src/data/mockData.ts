import type { Team, Tournament, Player, Game } from '../types';

export const mockTeam: Team = {
    id: 'team1',
    name: 'Red Dragons Softball',
    description: 'Premier regional softball club'
};

export const mockTournament: Tournament = {
    id: 't1',
    teamId: 'team1',
    name: 'Spring Championship 2026',
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    type: 'tournament'
};

export const mockPlayers: Player[] = [
    { id: 'p1', name: 'Sofia Martinez', jerseyNumber: '7', primaryPosition: 'SS', secondaryPositions: ['2B'], teamId: 'team1' },
    { id: 'p2', name: 'Emma Rodriguez', jerseyNumber: '22', primaryPosition: 'P', secondaryPositions: ['1B'], teamId: 'team1' },
    { id: 'p3', name: 'Isabella Chen', jerseyNumber: '3', primaryPosition: 'C', secondaryPositions: [], teamId: 'team1' },
    { id: 'p4', name: 'Mia Thompson', jerseyNumber: '14', primaryPosition: '1B', secondaryPositions: ['LF'], teamId: 'team1' },
    { id: 'p5', name: 'Olivia Davis', jerseyNumber: '9', primaryPosition: 'CF', secondaryPositions: ['RF'], teamId: 'team1' },
    { id: 'p6', name: 'Ava Wilson', jerseyNumber: '11', primaryPosition: '3B', secondaryPositions: [], teamId: 'team1' },
    { id: 'p7', name: 'Charlotte Brown', jerseyNumber: '5', primaryPosition: '2B', secondaryPositions: ['SS'], teamId: 'team1' },
    { id: 'p8', name: 'Amelia Garcia', jerseyNumber: '21', primaryPosition: 'LF', secondaryPositions: ['CF'], teamId: 'team1' },
    { id: 'p9', name: 'Harper Lee', jerseyNumber: '33', primaryPosition: 'RF', secondaryPositions: [], teamId: 'team1' },
    { id: 'p10', name: 'Evelyn White', jerseyNumber: '8', primaryPosition: 'DP', secondaryPositions: ['P'], teamId: 'team1' }
];

export const mockGames: Game[] = [
    {
        id: 'g1',
        tournamentId: 't1',
        date: '2026-03-01',
        opponent: 'Thunder Hawks',
        homeAway: 'home',
        gameType: 'regular',
        teamScore: 8,
        opponentScore: 3,
        playerStats: [
            { playerId: 'p1', ab: 4, h: 2, doubles: 1, triples: 0, hr: 0, rbi: 1, r: 2, bb: 1, so: 0, hbp: 0, sb: 2, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 2, a: 4, e: 0 },
            { playerId: 'p2', ab: 3, h: 1, doubles: 0, triples: 0, hr: 1, rbi: 2, r: 1, bb: 1, so: 1, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 7.0, pH: 5, pR: 3, er: 2, pBB: 2, pSO: 9, pHR: 1, pitchCount: 98, po: 0, a: 2, e: 0 },
            { playerId: 'p3', ab: 4, h: 2, doubles: 0, triples: 0, hr: 0, rbi: 1, r: 1, bb: 0, so: 1, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 8, a: 1, e: 0, cCS: 1, cSB: 0 },
            { playerId: 'p4', ab: 4, h: 1, doubles: 0, triples: 0, hr: 1, rbi: 3, r: 1, bb: 0, so: 2, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 9, a: 0, e: 1 },
            { playerId: 'p5', ab: 3, h: 1, doubles: 0, triples: 1, hr: 0, rbi: 0, r: 1, bb: 1, so: 0, hbp: 0, sb: 1, cs: 1, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 3, a: 0, e: 0 },
            { playerId: 'p6', ab: 4, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 2, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 1, a: 3, e: 1 },
            { playerId: 'p7', ab: 3, h: 2, doubles: 1, triples: 0, hr: 0, rbi: 0, r: 1, bb: 0, so: 0, hbp: 1, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 3, a: 2, e: 0 },
            { playerId: 'p8', ab: 4, h: 2, doubles: 0, triples: 0, hr: 0, rbi: 1, r: 0, bb: 0, so: 1, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 2, a: 0, e: 0 },
            { playerId: 'p9', ab: 3, h: 1, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 1, bb: 0, so: 1, hbp: 0, sb: 0, cs: 0, sac: 1, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 1, a: 0, e: 0 }
        ]
    },
    {
        id: 'g2',
        tournamentId: 't1',
        date: '2026-03-03',
        opponent: 'Storm Chasers',
        homeAway: 'away',
        gameType: 'regular',
        teamScore: 5,
        opponentScore: 4,
        playerStats: [
            { playerId: 'p1', ab: 4, h: 1, doubles: 0, triples: 0, hr: 1, rbi: 2, r: 1, bb: 0, so: 1, hbp: 0, sb: 1, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 1, a: 5, e: 1 },
            { playerId: 'p2', ab: 3, h: 2, doubles: 1, triples: 0, hr: 0, rbi: 0, r: 1, bb: 1, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 5.2, pH: 6, pR: 4, er: 3, pBB: 3, pSO: 7, pHR: 1, pitchCount: 87, po: 1, a: 1, e: 0 },
            { playerId: 'p3', ab: 4, h: 1, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 1, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 7, a: 0, e: 1, cCS: 0, cSB: 1 },
            { playerId: 'p4', ab: 4, h: 2, doubles: 1, triples: 0, hr: 0, rbi: 1, r: 1, bb: 0, so: 1, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 8, a: 1, e: 0 },
            { playerId: 'p5', ab: 3, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 1, so: 2, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 2, a: 0, e: 0 },
            { playerId: 'p6', ab: 3, h: 1, doubles: 0, triples: 0, hr: 0, rbi: 1, r: 1, bb: 1, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 0, a: 2, e: 0 },
            { playerId: 'p7', ab: 4, h: 1, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 1, hbp: 0, sb: 1, cs: 1, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 2, a: 3, e: 0 },
            { playerId: 'p8', ab: 3, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 1, so: 1, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 1, a: 0, e: 0 },
            { playerId: 'p9', ab: 4, h: 1, doubles: 0, triples: 0, hr: 0, rbi: 1, r: 1, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 2, a: 1, e: 0 },
            { playerId: 'p10', ab: 3, h: 1, doubles: 0, triples: 0, hr: 1, rbi: 2, r: 1, bb: 0, so: 1, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 1.1, pH: 1, pR: 0, er: 0, pBB: 0, pSO: 2, pHR: 0, pitchCount: 18, po: 0, a: 0, e: 0 }
        ]
    },
    {
        id: 'g3',
        tournamentId: 't1',
        date: '2026-03-05',
        opponent: 'Lightning Bolts',
        homeAway: 'home',
        gameType: 'playoff',
        teamScore: 12,
        opponentScore: 2,
        playerStats: [
            { playerId: 'p1', ab: 5, h: 3, doubles: 1, triples: 1, hr: 0, rbi: 3, r: 3, bb: 0, so: 0, hbp: 0, sb: 2, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 3, a: 4, e: 0 },
            { playerId: 'p2', ab: 4, h: 2, doubles: 0, triples: 0, hr: 1, rbi: 3, r: 2, bb: 1, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 7.0, pH: 4, pR: 2, er: 1, pBB: 1, pSO: 11, pHR: 0, pitchCount: 91, po: 0, a: 3, e: 0 },
            { playerId: 'p3', ab: 5, h: 2, doubles: 1, triples: 0, hr: 0, rbi: 2, r: 1, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 9, a: 2, e: 0, cCS: 2, cSB: 0 },
            { playerId: 'p4', ab: 4, h: 2, doubles: 1, triples: 0, hr: 1, rbi: 4, r: 2, bb: 1, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 7, a: 0, e: 0 },
            { playerId: 'p5', ab: 4, h: 2, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 2, bb: 1, so: 1, hbp: 0, sb: 1, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 4, a: 0, e: 0 },
            { playerId: 'p6', ab: 5, h: 1, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 1, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 1, a: 4, e: 0 },
            { playerId: 'p7', ab: 3, h: 1, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 1, bb: 1, so: 0, hbp: 1, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 4, a: 2, e: 1 },
            { playerId: 'p8', ab: 5, h: 3, doubles: 2, triples: 0, hr: 0, rbi: 0, r: 1, bb: 0, so: 0, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 0, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 2, a: 0, e: 0 },
            { playerId: 'p9', ab: 4, h: 0, doubles: 0, triples: 0, hr: 0, rbi: 0, r: 0, bb: 0, so: 2, hbp: 0, sb: 0, cs: 0, sac: 0, sf: 1, ip: 0, pH: 0, pR: 0, er: 0, pBB: 0, pSO: 0, pHR: 0, pitchCount: 0, po: 1, a: 0, e: 0 }
        ]
    }
];
