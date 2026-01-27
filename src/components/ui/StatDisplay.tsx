import type { PerformanceLevel } from '../../types';

interface StatValueProps {
    value: string | number;
    level?: PerformanceLevel;
    raw?: string;
    tooltip?: string;
}

export function StatValue({ value, level, raw, tooltip }: StatValueProps) {
    return (
        <span className={`stat-value ${level || ''}`} title={tooltip}>
            {value}
            {raw && <span className="stat-raw">({raw})</span>}
        </span>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    level?: PerformanceLevel;
    icon?: React.ReactNode;
    subtitle?: string;
}

export function StatCard({ title, value, level, icon, subtitle }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div>
                    <div className="stat-card-title">{title}</div>
                    {subtitle && <div className="card-subtitle">{subtitle}</div>}
                </div>
                {level && (
                    <div className={`stat-card-indicator ${level}`}>
                        {icon || (level === 'good' ? '↑' : level === 'poor' ? '↓' : '→')}
                    </div>
                )}
            </div>
            <div className={`stat-card-value ${level || ''}`}>{value}</div>
        </div>
    );
}

interface StatRowProps {
    label: string;
    value: string | number;
    level?: PerformanceLevel;
    raw?: string;
    tooltip?: string;
}

export function StatRow({ label, value, level, raw, tooltip }: StatRowProps) {
    return (
        <div className="stat-row">
            <span className="stat-label">{label}</span>
            <StatValue value={value} level={level} raw={raw} tooltip={tooltip} />
        </div>
    );
}
