import { useState } from 'react';
import type { Team } from '../../types';
import { generateId } from '../../lib/storage';

interface TeamFormProps {
    team?: Team;
    onSave: (team: Team) => void;
    onCancel: () => void;
}

export function TeamForm({ team, onSave, onCancel }: TeamFormProps) {
    const [name, setName] = useState(team?.name || '');
    const [description, setDescription] = useState(team?.description || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Team name is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        onSave({
            id: team?.id || generateId(),
            name: name.trim(),
            description: description.trim()
        });
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h3>{team ? 'Edit' : 'Create New'} Team</h3>
                <p>Manage your squad and organization details</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Team Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Red Dragons Softball"
                            className={`form-control ${errors.name ? 'error' : ''}`}
                        />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g. Competitive travel team based in Southern California"
                            className="form-control"
                            rows={3}
                            style={{ resize: 'none' }}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
                        Discard
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                        {team ? 'Save Changes' : 'Register Team'}
                    </button>
                </div>
            </form>
        </div>
    );
}
