import { useState, useRef } from 'react';
import type { Player, Position } from '../../types';
import { generateId, parsePlayerImport } from '../../lib/storage';

const POSITIONS: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DP', 'FLEX'];

interface PlayerFormProps {
    player?: Player;
    tournamentId: string;
    onSave: (player: Player) => void;
    onCancel: () => void;
    onBulkImport?: (players: Player[]) => void;
}

export function PlayerForm({ player, tournamentId, onSave, onCancel, onBulkImport }: PlayerFormProps) {
    const [name, setName] = useState(player?.name || '');
    const [jerseyNumber, setJerseyNumber] = useState(player?.jerseyNumber || '');
    const [primaryPosition, setPrimaryPosition] = useState<Position>(player?.primaryPosition || 'DP');
    const [secondaryPositions, setSecondaryPositions] = useState<Position[]>(player?.secondaryPositions || []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!jerseyNumber.trim()) errs.jerseyNumber = 'Jersey number is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        onSave({
            id: player?.id || generateId(),
            name: name.trim(),
            jerseyNumber: jerseyNumber.trim(),
            primaryPosition,
            secondaryPositions,
            tournamentId
        });
    };

    const toggleSecondary = (pos: Position) => {
        if (pos === primaryPosition) return;
        setSecondaryPositions(prev =>
            prev.includes(pos)
                ? prev.filter(p => p !== pos)
                : [...prev, pos]
        );
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            setImportText(text);
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        const players = parsePlayerImport(importText, tournamentId);
        if (players.length > 0 && onBulkImport) {
            onBulkImport(players);
            setShowImport(false);
            setImportText('');
        }
    };

    if (showImport) {
        return (
            <div className="form">
                <h3 className="form-title">Import Players</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontSize: '0.875rem' }}>
                    Format: Name, Jersey#, Position (one per line, comma or tab separated)
                </p>

                <div className="form-group">
                    <label>Upload File (CSV or TXT)</label>
                    <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="file-input"
                    />
                </div>

                <div className="form-group">
                    <label>Or paste data directly</label>
                    <textarea
                        value={importText}
                        onChange={e => setImportText(e.target.value)}
                        placeholder="Sofia Martinez, 7, SS&#10;Emma Rodriguez, 22, P&#10;Isabella Chen, 3, C"
                        rows={8}
                    />
                </div>

                {importText && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>
                        {parsePlayerImport(importText, tournamentId).length} players found
                    </p>
                )}

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowImport(false)}>
                        Back
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleImport}
                        disabled={!importText.trim()}
                    >
                        Import Players
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="form">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h3 className="form-title" style={{ margin: 0 }}>{player ? 'Edit Player' : 'New Player'}</h3>
                {!player && onBulkImport && (
                    <button type="button" className="btn btn-ghost" onClick={() => setShowImport(true)}>
                        📥 Import CSV/TXT
                    </button>
                )}
            </div>

            <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                    <label htmlFor="playerName">Player Name *</label>
                    <input
                        id="playerName"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Sofia Martinez"
                        className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="jersey">Jersey # *</label>
                    <input
                        id="jersey"
                        type="text"
                        value={jerseyNumber}
                        onChange={e => setJerseyNumber(e.target.value)}
                        placeholder="7"
                        className={errors.jerseyNumber ? 'error' : ''}
                    />
                    {errors.jerseyNumber && <span className="form-error">{errors.jerseyNumber}</span>}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="position">Primary Position</label>
                <select
                    id="position"
                    value={primaryPosition}
                    onChange={e => setPrimaryPosition(e.target.value as Position)}
                >
                    {POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Secondary Positions</label>
                <div className="position-grid">
                    {POSITIONS.filter(p => p !== primaryPosition).map(pos => (
                        <button
                            key={pos}
                            type="button"
                            className={`position-btn ${secondaryPositions.includes(pos) ? 'active' : ''}`}
                            onClick={() => toggleSecondary(pos)}
                        >
                            {pos}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {player ? 'Save Changes' : 'Add Player'}
                </button>
            </div>
        </form>
    );
}
