import { useState } from 'react';
import type { Tournament } from '../../types';
import { generateId } from '../../lib/storage';

interface TournamentFormProps {
    tournament?: Tournament;
    onSave: (tournament: Tournament) => void;
    onCancel: () => void;
}

export function TournamentForm({ tournament, onSave, onCancel }: TournamentFormProps) {
    const [name, setName] = useState(tournament?.name || '');
    const [startDate, setStartDate] = useState(tournament?.startDate || '');
    const [endDate, setEndDate] = useState(tournament?.endDate || '');
    const [type, setType] = useState<Tournament['type']>(tournament?.type || 'tournament');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!startDate) errs.startDate = 'Start date is required';

        if (startDate && endDate && startDate > endDate) {
            errs.endDate = 'End date must be after start date';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        onSave({
            id: tournament?.id || generateId(),
            name: name.trim(),
            startDate,
            endDate,
            type
        });
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', border: 'none', boxShadow: 'var(--shadow-premium)' }}>
            <div className="card-header" style={{ background: 'var(--accent-gradient)', color: 'white', padding: '24px 32px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{tournament ? 'Edit' : 'Create New'} Tournament</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', opacity: 0.9 }}>Setup your tournament details and tracking parameters</p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Tournament Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Spring Championship 2026"
                        className={errors.name ? 'error' : ''}
                        style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem' }}
                    />
                    {errors.name && <span className="form-error" style={{ color: 'var(--under)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className={errors.startDate ? 'error' : ''}
                            style={{ padding: '12px 16px', borderRadius: '10px' }}
                        />
                        {errors.startDate && <span className="form-error" style={{ color: 'var(--under)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.startDate}</span>}
                    </div>

                    <div className="form-group">
                        <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className={errors.endDate ? 'error' : ''}
                            style={{ padding: '12px 16px', borderRadius: '10px' }}
                        />
                        {errors.endDate && <span className="form-error" style={{ color: 'var(--under)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.endDate}</span>}
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Tournament Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['tournament', 'league', 'friendly'].map(t => (
                            <button
                                key={t}
                                type="button"
                                className={`btn ${type === t ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setType(t as Tournament['type'])}
                                style={{ flex: 1, textTransform: 'capitalize', padding: '10px' }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1, padding: '12px' }}>
                        Discard
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '12px' }}>
                        {tournament ? 'Save Changes' : 'Initialize Tournament'}
                    </button>
                </div>
            </form>
        </div>
    );
}
