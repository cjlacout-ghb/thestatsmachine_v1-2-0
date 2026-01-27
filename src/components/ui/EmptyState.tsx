interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon = '📋', title, message, action }: EmptyStateProps) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{message}</p>
            {action && <div style={{ marginTop: '16px' }}>{action}</div>}
        </div>
    );
}
