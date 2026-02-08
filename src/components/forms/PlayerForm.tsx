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
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow-premium)' }}>
                <div className="card-header" style={{ background: 'var(--accent-gradient)', color: 'white', padding: '24px 32px' }}>
                    <h3 style={{ margin: 0, fontWeight: '800' }}>Bulk Player Import</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', opacity: 0.9 }}>Upload CSV or paste roster data from your league portal</p>
                </div>

                <div style={{ padding: '32px' }}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Upload Data File</label>
                        <div style={{ border: '2px dashed var(--border-color)', padding: '24px', textAlign: 'center', borderRadius: '12px', background: 'var(--bg-primary)' }}>
                            <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                            />
                            <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                Select CSV or TXT File
                            </button>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Format: Name, Jersey#, Position (one per line)</p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Or Paste Roster Data</label>
                        <textarea
                            value={importText}
                            onChange={e => setImportText(e.target.value)}
                            placeholder="Sofia Martinez, 7, SS&#10;Emma Rodriguez, 22, P"
                            rows={6}
                            style={{ padding: '16px', borderRadius: '10px', fontSize: '0.9375rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowImport(false)} style={{ flex: 1 }}>
                            Back
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleImport}
                            disabled={!importText.trim()}
                            style={{ flex: 2 }}
                        >
                            Import {importText ? parsePlayerImport(importText, tournamentId).length : ''} Players
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow-premium)' }}>
            <div className="card-header" style={{ background: 'var(--accent-gradient)', color: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontWeight: '800' }}>{player ? 'Edit' : 'Add New'} Athlete</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', opacity: 0.9 }}>Enter individual player details for tracking</p>
                </div>
                {!player && onBulkImport && (
                    <button type="button" className="btn btn-ghost" onClick={() => setShowImport(true)} style={{ color: 'white', background: 'rgba(255,255,255,0.1)' }}>
                        Bulk Import
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Sofia Martinez"
                            className={errors.name ? 'error' : ''}
                            style={{ padding: '12px 16px', borderRadius: '10px' }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Jersey #</label>
                        <input
                            type="text"
                            value={jerseyNumber}
                            onChange={e => setJerseyNumber(e.target.value)}
                            placeholder="7"
                            className={errors.jerseyNumber ? 'error' : ''}
                            style={{ padding: '12px 16px', borderRadius: '10px' }}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Primary Position</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {POSITIONS.map(pos => (
                            <button
                                key={pos}
                                type="button"
                                className={`btn ${primaryPosition === pos ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => {
                                    setPrimaryPosition(pos);
                                    setSecondaryPositions(prev => prev.filter(p => p !== pos));
                                }}
                                style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.8125rem' }}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Secondary Options</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {POSITIONS.filter(p => p !== primaryPosition).map(pos => (
                            <button
                                key={pos}
                                type="button"
                                className={`btn ${secondaryPositions.includes(pos) ? 'btn-primary' : 'btn-secondary'}`}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.8125rem',
                                    background: secondaryPositions.includes(pos) ? 'var(--accent-soft)' : 'transparent',
                                    color: secondaryPositions.includes(pos) ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    borderColor: secondaryPositions.includes(pos) ? 'var(--accent-primary)' : 'var(--border-color)'
                                }}
                                onClick={() => toggleSecondary(pos)}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1, padding: '12px' }}>
                        Discard
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '12px' }}>
                        {player ? 'Save Profile' : 'Add to Roster'}
                    </button>
                </div>
            </form>
        </div>
    );
}
