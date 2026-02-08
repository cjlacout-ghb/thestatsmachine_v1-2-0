import { useState } from 'react';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
}

interface StatTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    onRowClick?: (row: T) => void;
}

export function StatTable<T>({
    data,
    columns,
    keyField,
    onRowClick
}: StatTableProps<T>) {
    const [sortKey, setSortKey] = useState<keyof T | string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const handleSort = (key: keyof T | string) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const getValue = (row: T, key: keyof T | string): unknown => {
        return (row as Record<string, unknown>)[key as string];
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const aVal = getValue(a, sortKey);
        const bVal = getValue(b, sortKey);
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortDir === 'asc'
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="stat-table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th
                                key={String(col.key)}
                                onClick={() => col.sortable !== false && handleSort(col.key)}
                                className={sortKey === col.key ? 'sorted' : ''}
                                style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {col.label}
                                    {col.sortable !== false && (
                                        <span style={{ fontSize: '0.6rem', opacity: sortKey === col.key ? 1 : 0.3 }}>
                                            {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map(row => (
                        <tr
                            key={String(getValue(row, keyField))}
                            onClick={() => onRowClick?.(row)}
                            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                        >
                            {columns.map(col => (
                                <td key={String(col.key)} className={col.className}>
                                    {col.render ? col.render(row) : String(getValue(row, col.key) ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
