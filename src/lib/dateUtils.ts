export function formatLocalDate(dateStr: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
    if (!dateStr) return '';

    // Split YYYY-MM-DD to avoid timezone shifts
    const [year, month, day] = dateStr.split('-').map(Number);

    // Create date object using local components (month is 0-indexed)
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-US', options);
}

export function getMonthStr(dateStr: string): string {
    return formatLocalDate(dateStr, { month: 'short' }).toUpperCase();
}

export function getDayStr(dateStr: string): string {
    return formatLocalDate(dateStr, { day: 'numeric' });
}
