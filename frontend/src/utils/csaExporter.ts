import type { Move, Piece } from '../types';

import { PIECE_DATA } from './pieceData';

// Convert internal PieceType to CSA piece code
function getPieceCSACode(piece: Piece): string {
    // If promoted, we need to check the promoted type's code
    let typeToExport = piece.type;
    
    if (piece.isPromoted) {
        const pData = PIECE_DATA[piece.type];
        if (pData && pData.promotedType) {
            typeToExport = pData.promotedType;
        }
    }

    // CSA piece codes mapping - Sync with csaParser.ts
    const csaMap: { [key: string]: string } = {
        'Ousho': 'OU',
        'Kinsho': 'KI',
        'Ginsho': 'GI',
        'Dosho': 'DO',
        'Mohyo': 'FL',  // Ferocious Leopard
        'Moko': 'BT',   // Blind Tiger
        'Suizo': 'DE',  // Drunk Elephant
        'Chunin': 'GB', // Go-Between
        'Fuhyo': 'FU',
        'Kyosha': 'KY',
        'Hensha': 'RC', // Reverse Chariot
        'Hisha': 'HI',
        'Kakugyo': 'KA',
        'Ryume': 'DH',  // Dragon Horse
        'Ryuou': 'DK',  // Dragon King
        'Ogyo': 'SM',   // Side Mover
        'Shugyo': 'VM', // Vertical Mover
        'Kirin': 'KR',
        'Ho_o': 'PH',   // Phoenix
        'Shishi': 'LN', // Lion
        'Hon_o': 'FK',  // Free King
        // Promoted types
        'Taishi': 'PR',
        'Hakuku': 'WB',
        'Keigei': 'WH',
        'Kakuou': 'HF',
        'Hiju': 'SE',
        'Honcho': 'FB',
        'Higyu': 'FO',
        'Hiroku': 'FS',
        'Kinbisha': 'GD'
    };

    // Special cases for common CSA promoted codes
    if (piece.isPromoted) {
        if (typeToExport === 'Kinsho') return 'TO';
        if (typeToExport === 'Suizo') return 'NK'; // Promoted Go-Between
        if (typeToExport === 'Shugyo') return 'NG'; // Promoted Silver
        if (typeToExport === 'Kakugyo') return 'NM'; // Promoted Leopard
        if (typeToExport === 'Ogyo') return 'NC'; // Promoted Copper
    }

    return csaMap[typeToExport] || 'FU';
}

// Convert a single move to CSA notation
function moveToCSA(move: Move): string {
    const player = move.piece.owner === 'sente' ? '+' : '-';

    // CSA uses 1-based indexing
    // In our board, x=0 is Right (col 1), x=11 is Left (col 12)
    const fromX = (move.from.x + 1).toString().padStart(2, '0');
    const fromY = (move.from.y + 1).toString().padStart(2, '0');
    const toX = (move.to.x + 1).toString().padStart(2, '0');
    const toY = (move.to.y + 1).toString().padStart(2, '0');

    const pieceCode = getPieceCSACode(move.piece);

    return `${player}${fromX}${fromY}${toX}${toY}${pieceCode}`;
}

// Export moves to CSA format
export function exportToCSA(moves: Move[]): string {
    let csa = 'V2.2\n';

    // Metadata
    csa += 'N+Sente\n';
    csa += 'N-Gote\n';
    csa += '$EVENT:Chu Shogi Match\n';
    
    // We don't hardcode P1-P12 here as it depends on the initial setup used.
    // For now, assume starting from a known state or add PI if needed.
    csa += '+\n'; 

    // Add all moves
    for (const move of moves) {
        csa += moveToCSA(move) + '\n';
    }

    return csa;
}

// Download CSA file
export function downloadCSAFile(csaText: string, filename: string) {
    const blob = new Blob([csaText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csa`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
