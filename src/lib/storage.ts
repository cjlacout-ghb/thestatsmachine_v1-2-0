import type { AppData, Tournament, Player, Game } from '../types';

const STORAGE_KEY = 'softball_stats_data';

const DEFAULT_DATA: AppData = {
    tournaments: [],
    players: [],
    games: []
};

export function loadData(): AppData {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_DATA;
        return JSON.parse(stored);
    } catch {
        console.error('Failed to load data from localStorage');
        return DEFAULT_DATA;
    }
}

export function saveData(data: AppData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        console.error('Failed to save data to localStorage');
    }
}

export function saveTournament(tournament: Tournament): void {
    const data = loadData();
    const idx = data.tournaments.findIndex(t => t.id === tournament.id);
    if (idx >= 0) {
        data.tournaments[idx] = tournament;
    } else {
        data.tournaments.push(tournament);
    }
    saveData(data);
}

export function deleteTournament(id: string): void {
    const data = loadData();
    data.tournaments = data.tournaments.filter(t => t.id !== id);
    // Also delete related players and games
    data.players = data.players.filter(p => p.tournamentId !== id);
    data.games = data.games.filter(g => g.tournamentId !== id);
    saveData(data);
}

export function savePlayer(player: Player): void {
    const data = loadData();
    const idx = data.players.findIndex(p => p.id === player.id);
    if (idx >= 0) {
        data.players[idx] = player;
    } else {
        data.players.push(player);
    }
    saveData(data);
}

export function deletePlayer(id: string): void {
    const data = loadData();
    data.players = data.players.filter(p => p.id !== id);
    // Remove player from all game stats
    data.games.forEach(g => {
        g.playerStats = g.playerStats.filter(ps => ps.playerId !== id);
    });
    saveData(data);
}

export function saveGame(game: Game): void {
    const data = loadData();
    const idx = data.games.findIndex(g => g.id === game.id);
    if (idx >= 0) {
        data.games[idx] = game;
    } else {
        data.games.push(game);
    }
    saveData(data);
}

export function deleteGame(id: string): void {
    const data = loadData();
    data.games = data.games.filter(g => g.id !== id);
    saveData(data);
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Import players from CSV or TXT
export function parsePlayerImport(text: string, tournamentId: string): Player[] {
    const lines = text.trim().split('\n');
    const players: Player[] = [];

    for (const line of lines) {
        const parts = line.split(/[,\t]/).map(s => s.trim());
        if (parts.length >= 2) {
            players.push({
                id: generateId(),
                name: parts[0],
                jerseyNumber: parts[1],
                primaryPosition: (parts[2] as Player['primaryPosition']) || 'DP',
                secondaryPositions: [],
                tournamentId
            });
        }
    }

    return players;
}
