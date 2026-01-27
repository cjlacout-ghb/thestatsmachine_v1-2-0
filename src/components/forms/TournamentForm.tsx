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
        if (!endDate) errs.endDate = 'End date is required';
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
        <form onSubmit={handleSubmit} className="form">
            <h3 className="form-title">{tournament ? 'Edit Tournament' : 'New Tournament'}</h3>

            <div className="form-group">
                <label htmlFor="name">Tournament Name *</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Spring Championship 2026"
                    className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="startDate">Start Date *</label>
                    <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className={errors.startDate ? 'error' : ''}
                    />
                    {errors.startDate && <span className="form-error">{errors.startDate}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="endDate">End Date *</label>
                    <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className={errors.endDate ? 'error' : ''}
                    />
                    {errors.endDate && <span className="form-error">{errors.endDate}</span>}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="type">Tournament Type</label>
                <select id="type" value={type} onChange={e => setType(e.target.value as Tournament['type'])}>
                    <option value="tournament">Tournament</option>
                    <option value="league">League</option>
                    <option value="friendly">Friendly</option>
                </select>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {tournament ? 'Save Changes' : 'Create Tournament'}
                </button>
            </div>
        </form>
    );
}
