import type { AppData, Tournament, Player, Game } from '../types';

const STORAGE_KEY = 'softball_stats_data';

const DEFAULT_DATA: AppData = {
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
            return JSON.parse(stored);
        } catch {
            console.error('Failed to load data from localStorage');
            return DEFAULT_DATA;
        }
    }

    async save(data: AppData): Promise<void> {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            console.error('Failed to save data to localStorage');
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
            return JSON.parse(text);
        } catch (err) {
            console.error('Failed to load file:', err);
            return DEFAULT_DATA;
        }
    }

    async save(data: AppData): Promise<void> {
        if (!this.handle) return;

        try {
            const writable = await (this.handle as any).createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        } catch (err) {
            console.error('Failed to save file:', err);
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
        return this.driver.load();
    }

    async save(data: AppData): Promise<void> {
        return this.driver.save(data);
    }

    hasLegacyData(): boolean {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return false;
        try {
            const parsed = JSON.parse(data);
            return parsed.tournaments.length > 0 || parsed.players.length > 0 || parsed.games.length > 0;
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

export async function deleteTournament(id: string): Promise<void> {
    const data = await loadData();
    data.tournaments = data.tournaments.filter(t => t.id !== id);
    // Also delete related players and games
    data.players = data.players.filter(p => p.tournamentId !== id);
    data.games = data.games.filter(g => g.tournamentId !== id);
    await saveData(data);
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
