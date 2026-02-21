import type { AppData, Team, Tournament, Player, Game } from '../types';

export const STORAGE_KEY = 'softball_stats_data';

const DEFAULT_DATA: AppData = {
    teams: [],
    tournaments: [],
    players: [],
    games: []
};

import { storeFileHandle, getStoredFileHandle, clearStoredFileHandle } from './db';

const DRIVER_PREFERENCE_KEY = 'tsm_storage_driver';

/**
 * Interface for storage implementations
 */
export interface StorageDriver {
    name: string;
    type: 'local' | 'file';
    load(): Promise<AppData>;
    save(data: AppData): Promise<void>;
}

/**
 * Browser LocalStorage Implementation
 */
export class LocalStorageDriver implements StorageDriver {
    name = 'Browser Cache (Local)';
    type: 'local' = 'local';

    async load(): Promise<AppData> {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return DEFAULT_DATA;
            const parsed = JSON.parse(stored);

            // Migration: Add teams array if missing
            if (!parsed.teams) parsed.teams = [];

            // Migration: Ensure tournaments have teamId
            if (parsed.tournaments.length > 0 && parsed.teams.length === 0) {
                const defaultTeam: Team = { id: 'default-team', name: 'My Team' };
                parsed.teams.push(defaultTeam);
                parsed.tournaments.forEach((t: any) => {
                    if (!t.teamId && !t.participatingTeamIds) t.participatingTeamIds = [defaultTeam.id];
                });
                // Migration: Ensure players have teamId
                if (parsed.players) {
                    parsed.players.forEach((p: any) => {
                        if (!p.teamId) {
                            if (p.tournamentId) {
                                const tourney = parsed.tournaments.find((t: any) => t.id === p.tournamentId);
                                p.teamId = tourney?.participatingTeamIds?.[0] || defaultTeam.id;
                            } else {
                                p.teamId = defaultTeam.id;
                            }
                        }
                    });
                }
            }

            // Migration: teamId -> participatingTeamIds
            if (parsed.tournaments) {
                parsed.tournaments.forEach((t: any) => {
                    if (t.teamId && !t.participatingTeamIds) {
                        t.participatingTeamIds = [t.teamId];
                        delete t.teamId;
                    }
                });
            }

            return parsed;
        } catch {
            console.error('Failed to load data from localStorage');
            return DEFAULT_DATA;
        }
    }

    async save(data: AppData): Promise<void> {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save data to localStorage', e);
            throw new Error('Browser storage is full or unavailable.');
        }
    }
}

/**
 * Native File System Implementation
 */
export class FileSystemDriver implements StorageDriver {
    name = 'Local File';
    type: 'file' = 'file';
    private handle: FileSystemFileHandle | null = null;

    constructor(handle?: FileSystemFileHandle) {
        if (handle) this.handle = handle;
    }

    async setHandle(handle: FileSystemFileHandle) {
        this.handle = handle;
        await storeFileHandle(handle);
    }

    async load(): Promise<AppData> {
        if (!this.handle) return DEFAULT_DATA;

        try {
            // Check permissions
            const options = { mode: 'readwrite' as FileSystemPermissionMode };
            if (await this.handle.queryPermission(options) !== 'granted') {
                if (await this.handle.requestPermission(options) !== 'granted') {
                    throw new Error('Permission denied');
                }
            }

            const file = await this.handle.getFile();
            const text = await file.text();
            if (!text) return DEFAULT_DATA;
            const parsed = JSON.parse(text);

            // Migration: Add teams array if missing
            if (!parsed.teams) parsed.teams = [];

            // Migration: Ensure tournaments have teamId
            if (parsed.tournaments.length > 0 && parsed.teams.length === 0) {
                const defaultTeam: Team = { id: 'default-team', name: 'My Team' };
                parsed.teams.push(defaultTeam);
                parsed.tournaments.forEach((t: any) => {
                    if (!t.teamId && !t.participatingTeamIds) t.participatingTeamIds = [defaultTeam.id];
                });
            }

            // Migration: teamId -> participatingTeamIds
            if (parsed.tournaments) {
                parsed.tournaments.forEach((t: any) => {
                    if (t.teamId && !t.participatingTeamIds) {
                        t.participatingTeamIds = [t.teamId];
                        delete t.teamId;
                    }
                });
            }

            return parsed;
        } catch (err) {
            console.error('Failed to load file:', err);
            throw err; // Throw to let the manager handle the fallback
        }
    }

    async save(data: AppData): Promise<void> {
        if (!this.handle) throw new Error('No file handle available');

        try {
            const writable = await (this.handle as any).createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        } catch (err) {
            console.error('Failed to save file:', err);
            throw new Error(`Failed to save to local file: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    getFileHandle() {
        return this.handle;
    }
}

/**
 * Manager to handle switching between storage drivers
 */
class StorageManager {
    private driver: StorageDriver;

    constructor(defaultDriver: StorageDriver) {
        this.driver = defaultDriver;
    }

    async init() {
        const pref = localStorage.getItem(DRIVER_PREFERENCE_KEY);
        if (pref === 'file') {
            const handle = await getStoredFileHandle();
            if (handle) {
                this.driver = new FileSystemDriver(handle);
            }
        }
    }

    async setDriver(driver: StorageDriver) {
        this.driver = driver;
        localStorage.setItem(DRIVER_PREFERENCE_KEY, driver.type);
        if (driver.type === 'local') {
            await clearStoredFileHandle();
        }
        console.log(`Storage switched to: ${driver.name}`);
    }

    getDriver(): StorageDriver {
        return this.driver;
    }

    getDriverName(): string {
        return this.driver.name;
    }

    async load(): Promise<AppData> {
        console.log(`[Storage] Loading data using driver: ${this.driver.name}`);
        let fileData: AppData;

        try {
            fileData = await this.driver.load();
        } catch (err) {
            console.warn(`[Storage] Driver ${this.driver.name} failed to load. Checking LocalStorage fallback...`, err);
            // Fallback to localStorage if driver fails
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch {
                    return DEFAULT_DATA;
                }
            }
            return DEFAULT_DATA;
        }

        // If file driver returned default/empty but we have localStorage data, use that as fallback
        if (this.driver.type === 'file' &&
            fileData.teams.length === 0 &&
            fileData.tournaments.length === 0) {
            console.log('[Storage] File driver returned empty data. Checking LocalStorage fallback...');
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    console.log(`[Storage] Fallback success. Found ${parsed.teams?.length || 0} teams in cache.`);
                    return parsed;
                } catch {
                    return fileData;
                }
            }
        }

        console.log(`[Storage] Load complete. Found ${fileData.teams?.length || 0} teams.`);
        return fileData;
    }

    async save(data: AppData): Promise<void> {
        // ALWAYS mirror to localStorage as a safety cache
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to mirror data to localStorage:', e);
        }

        return this.driver.save(data);
    }

    hasLegacyData(): boolean {
        // Now that we mirror, legacy data is always present. 
        // We only show the migration banner if the preference is still 'local' but there's data.
        const pref = localStorage.getItem(DRIVER_PREFERENCE_KEY);
        if (pref === 'file') return false;

        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return false;
        try {
            const parsed = JSON.parse(data);
            return (parsed.teams && parsed.teams.length > 0) ||
                parsed.tournaments.length > 0 ||
                parsed.players.length > 0 ||
                parsed.games.length > 0;
        } catch {
            return false;
        }
    }

    clearLegacyData() {
        localStorage.removeItem(STORAGE_KEY);
    }
}

// Initialize with LocalStorage by default
export const storageManager = new StorageManager(new LocalStorageDriver());

// --- High Level API (Asynchronous) ---

export async function loadData(): Promise<AppData> {
    return storageManager.load();
}

export async function saveData(data: AppData): Promise<void> {
    return storageManager.save(data);
}

export async function saveTeam(team: Team): Promise<void> {
    const data = await loadData();
    const idx = data.teams.findIndex(t => t.id === team.id);
    if (idx >= 0) {
        data.teams[idx] = team;
    } else {
        data.teams.push(team);
    }
    await saveData(data);
}

export async function deleteTeam(id: string): Promise<AppData> {
    const data = await loadData();
    data.teams = data.teams.filter(t => t.id !== id);

    // Remove team from tournaments
    data.tournaments.forEach(t => {
        if (t.participatingTeamIds) {
            t.participatingTeamIds = t.participatingTeamIds.filter(tid => tid !== id);
        }
    });

    // Delete tournaments that have no more teams
    const tournamentsToDelete = data.tournaments.filter(t => t.participatingTeamIds.length === 0).map(t => t.id);
    data.tournaments = data.tournaments.filter(t => t.participatingTeamIds.length > 0);

    // Delete players for this team
    data.players = data.players.filter(p => p.teamId !== id);

    // Delete games related to deleted tournaments
    data.games = data.games.filter(g => !tournamentsToDelete.includes(g.tournamentId));

    await saveData(data);
    return data;
}

export async function saveTournament(tournament: Tournament): Promise<void> {
    const data = await loadData();
    const idx = data.tournaments.findIndex(t => t.id === tournament.id);
    if (idx >= 0) {
        data.tournaments[idx] = tournament;
    } else {
        data.tournaments.push(tournament);
    }
    await saveData(data);
}

export async function deleteTournament(id: string): Promise<AppData> {
    const data = await loadData();
    data.tournaments = data.tournaments.filter(t => t.id !== id);
    // Also delete related games (but NOT players as they are team-level now)
    // data.players = data.players.filter(p => p.tournamentId !== id); // REMOVED
    data.games = data.games.filter(g => g.tournamentId !== id);
    await saveData(data);
    return data;
}

export async function savePlayer(player: Player): Promise<void> {
    const data = await loadData();
    const idx = data.players.findIndex(p => p.id === player.id);
    if (idx >= 0) {
        data.players[idx] = player;
    } else {
        data.players.push(player);
    }
    await saveData(data);
}

export async function deletePlayer(id: string): Promise<void> {
    const data = await loadData();
    data.players = data.players.filter(p => p.id !== id);
    // Remove player from all game stats
    data.games.forEach(g => {
        g.playerStats = g.playerStats.filter(ps => ps.playerId !== id);
    });
    await saveData(data);
}

export async function saveGame(game: Game): Promise<void> {
    const data = await loadData();
    const idx = data.games.findIndex(g => g.id === game.id);
    if (idx >= 0) {
        data.games[idx] = game;
    } else {
        data.games.push(game);
    }
    await saveData(data);
}

export async function deleteGame(id: string): Promise<void> {
    const data = await loadData();
    data.games = data.games.filter(g => g.id !== id);
    await saveData(data);
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Import players from CSV or TXT
export function parsePlayerImport(text: string, teamId: string): Player[] {
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
                teamId
            });
        }
    }

    return players;
}
