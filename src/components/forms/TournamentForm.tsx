import { useState, useEffect } from 'react';
import type { Tournament, Team } from '../../types';
import { generateId } from '../../lib/storage';

interface TournamentFormProps {
    tournament?: Tournament;
    availableTeams: Team[];
    initialTeamId?: string;
    onSave: (tournament: Tournament) => void;
    onCancel: () => void;
}

export function TournamentForm({ tournament, availableTeams, initialTeamId, onSave, onCancel }: TournamentFormProps) {
    const [name, setName] = useState(tournament?.name || '');
    const [participatingTeamIds, setParticipatingTeamIds] = useState<string[]>(
        tournament?.participatingTeamIds || (initialTeamId ? [initialTeamId] : [])
    );
    const [startDate, setStartDate] = useState(tournament?.startDate || '');
    const [endDate, setEndDate] = useState(tournament?.endDate || '');
    const [type, setType] = useState<Tournament['type']>(tournament?.type || 'tournament');
    const [location, setLocation] = useState(tournament?.location || '');
    const [format, setFormat] = useState(tournament?.format || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!startDate) errs.startDate = 'Start date is required';
        if (participatingTeamIds.length === 0) errs.teams = 'At least one team must be selected';

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
            participatingTeamIds,
            name: name.trim(),
            startDate,
            endDate,
            type,
            location: location.trim(),
            format: format.trim()
        });
    };

    const toggleTeam = (teamId: string) => {
        setParticipatingTeamIds(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h3>{tournament ? 'Edit' : 'Create New'} Event</h3>
                <p>Setup your tournament details and participating teams</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Event Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Spring Championship 2026"
                            className={`form-control ${errors.name ? 'error' : ''}`}
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Participating Teams</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                            {availableTeams.map(team => (
                                <label key={team.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={participatingTeamIds.includes(team.id)}
                                        onChange={() => toggleTeam(team.id)}
                                    />
                                    {team.name}
                                </label>
                            ))}
                        </div>
                        {errors.teams && <span className="form-error">{errors.teams}</span>}
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

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Location (Optional)</label>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="e.g. Central Park"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Format (Optional)</label>
                            <input
                                type="text"
                                value={format}
                                onChange={e => setFormat(e.target.value)}
                                placeholder="e.g. Pool Play + Bracket"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label mb-sm">Event Type</label>
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
                        {tournament ? 'Save Changes' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
