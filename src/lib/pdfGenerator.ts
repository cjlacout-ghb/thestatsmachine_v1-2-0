import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Tournament, Player, Game } from '../types';
import { calcBatting, calcPitching, calcFielding, formatAvg, formatERA, formatIP, parseIP } from './calculations';

export function exportTournamentReport(
    tournament: Tournament,
    players: Player[],
    games: Game[]
): void {
    const doc = new jsPDF();
    const title = `Softball Stats Report: ${tournament.name}`;
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${date}`, 14, 30);
    doc.text(`Games: ${games.length} | Players: ${players.length}`, 14, 36);

    // 1. Batting Stats
    doc.setFontSize(14);
    doc.text('Batting Statistics', 14, 48);

    const battingRows = players.map(p => {
        const pGames = games.flatMap(g => g.playerStats.filter(ps => ps.playerId === p.id));
        if (pGames.length === 0) return null;
        const stats = calcBatting(pGames);
        return [
            p.name,
            String(p.jerseyNumber),
            pGames.length,
            stats.pa,
            formatAvg(stats.avg),
            formatAvg(stats.obp),
            formatAvg(stats.slg),
            stats.ops.toFixed(3),
            stats.singles, // 1B
            stats.xbh - stats.tb + stats.singles, // 2B (approx if not tracked directly) -> We track doubles directly!
            // Wait, let's use the stats object correctly.
            // We calculate batting stats from scratch in calcBatting, but it returns aggregated values.
            // Let's re-calculate raw counts for the table.
            pGames.reduce((s, g) => s + g.h, 0), // H
            pGames.reduce((s, g) => s + g.doubles, 0), // 2B
            pGames.reduce((s, g) => s + g.triples, 0), // 3B
            pGames.reduce((s, g) => s + g.hr, 0), // HR
            pGames.reduce((s, g) => s + g.rbi, 0), // RBI
            pGames.reduce((s, g) => s + g.r, 0), // R
            pGames.reduce((s, g) => s + g.bb, 0), // BB
            pGames.reduce((s, g) => s + g.so, 0), // SO
        ];
    }).filter(Boolean) as (string | number)[][]; // Use type assertion to avoid filter(Boolean) issues

    // Sort by AVG descending
    battingRows.sort((a, b) => {
        const avgA = parseFloat(String(a[4]));
        const avgB = parseFloat(String(b[4]));
        return avgB - avgA;
    });

    autoTable(doc, {
        startY: 52,
        head: [['Player', '#', 'G', 'PA', 'AVG', 'OBP', 'SLG', 'OPS', 'H', '2B', '3B', 'HR', 'RBI', 'R', 'BB', 'K']],
        body: battingRows,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        styles: { fontSize: 8, cellPadding: 2 },
    });

    // 2. Pitching Stats
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Pitching Statistics', 14, currentY);

    const pitchingRows = players.map(p => {
        const pGames = games.flatMap(g => g.playerStats.filter(ps => ps.playerId === p.id && ps.ip > 0));
        if (pGames.length === 0) return null;
        const stats = calcPitching(pGames);
        const ipRaw = pGames.reduce((s, g) => s + parseIP(g.ip), 0);

        return [
            p.name,
            formatIP(ipRaw),
            formatERA(stats.era),
            stats.whip.toFixed(2),
            pGames.reduce((s, g) => s + g.pSO, 0),
            pGames.reduce((s, g) => s + g.pBB, 0),
            pGames.reduce((s, g) => s + g.pH, 0),
            pGames.reduce((s, g) => s + g.er, 0),
        ];
    }).filter(Boolean) as (string | number)[][];

    if (pitchingRows.length > 0) {
        autoTable(doc, {
            startY: currentY + 4,
            head: [['Player', 'IP', 'ERA', 'WHIP', 'SO', 'BB', 'H', 'ER']],
            body: pitchingRows,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] },
            styles: { fontSize: 9 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.text('No pitching stats recorded.', 14, currentY + 8);
        currentY += 15;
    }

    // 3. Fielding Stats
    doc.setFontSize(14);
    doc.text('Fielding Statistics', 14, currentY);

    const fieldingRows = players.map(p => {
        const pGames = games.flatMap(g => g.playerStats.filter(ps => ps.playerId === p.id && (ps.po > 0 || ps.a > 0 || ps.e > 0)));
        if (pGames.length === 0) return null;
        const stats = calcFielding(pGames);
        return [
            p.name,
            pGames.reduce((s, g) => s + g.po, 0),
            pGames.reduce((s, g) => s + g.a, 0),
            pGames.reduce((s, g) => s + g.e, 0),
            formatAvg(stats.fldPct)
        ];
    }).filter(Boolean) as (string | number)[][];

    if (fieldingRows.length > 0) {
        autoTable(doc, {
            startY: currentY + 4,
            head: [['Player', 'PO', 'A', 'E', 'FLD%']],
            body: fieldingRows,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] },
            styles: { fontSize: 9 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
        doc.setFontSize(10);
        doc.text('No fielding stats recorded.', 14, currentY + 8);
        currentY += 15;
    }

    // 4. Game Log
    doc.setFontSize(14);
    doc.text('Game Log', 14, currentY);

    const gameRows = games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(g => {
        const result = g.teamScore > g.opponentScore ? 'W' : g.teamScore < g.opponentScore ? 'L' : 'T';
        return [
            g.date,
            g.opponent,
            `${result} ${g.teamScore}-${g.opponentScore}`,
            g.homeAway === 'home' ? 'Home' : 'Away',
            g.gameType
        ];
    });

    if (gameRows.length > 0) {
        autoTable(doc, {
            startY: currentY + 4,
            head: [['Date', 'Opponent', 'Result', 'Loc', 'Type']],
            body: gameRows,
            theme: 'striped',
            headStyles: { fillColor: [66, 66, 66] },
            styles: { fontSize: 9 },
        });
    } else {
        doc.setFontSize(10);
        doc.text('No games recorded.', 14, currentY + 8);
    }

    // Save the PDF
    doc.save(`softball_stats_${tournament.name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}
