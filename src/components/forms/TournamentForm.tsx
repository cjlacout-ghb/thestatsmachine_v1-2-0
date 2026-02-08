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
        <div className="modal-content">
            <div className="modal-header">
                <h3>{tournament ? 'Edit' : 'Create New'} Tournament</h3>
                <p>Setup your tournament details and tracking parameters</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Tournament Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Spring Championship 2026"
                            className={`form-control ${errors.name ? 'error' : ''}`}
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className={`form-control ${errors.startDate ? 'error' : ''}`}
                            />
                            {errors.startDate && <span className="form-error">{errors.startDate}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className={`form-control ${errors.endDate ? 'error' : ''}`}
                            />
                            {errors.endDate && <span className="form-error">{errors.endDate}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label mb-sm">Tournament Type</label>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            {['tournament', 'league', 'friendly'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`btn ${type === t ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setType(t as Tournament['type'])}
                                    style={{ flex: 1, textTransform: 'capitalize' }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
                        Discard
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                        {tournament ? 'Save Changes' : 'Initialize Tournament'}
                    </button>
                </div>
            </form>
        </div>
    );
}
