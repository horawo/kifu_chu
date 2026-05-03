import type { BoardState, Piece, Player, Position } from '../types';
import { createInitialBoard } from './chuShogiRules';
import { PIECE_DATA } from './pieceData';

// Map between standard/likely CSA codes and Internal Types
// Using 2-char codes.
// Extension: 0=10, A=11, B=12 for coordinates.
// Format: +12121112LN (Sente moves Lion from 12,12 to 11,12)

// Map between standard/likely CSA codes and Internal Types
// Using 2-char codes based on common software (Lion, etc).
// Coordination: 0=10, A=11, B=12.

const CSA_TO_INTERNAL: { [key: string]: string } = {
    'FU': 'Fuhyo',
    'KY': 'Kyosha',
    'KA': 'Kakugyo',
    'HI': 'Hisha',
    'OU': 'Ousho',
    'KI': 'Kinsho',
    'GI': 'Ginsho',
    'DO': 'Dosho',  // Copper
    'FL': 'Mohyo',  // Ferocious Leopard
    'BT': 'Moko',   // Blind Tiger
    'DE': 'Suizo',  // Drunk Elephant
    'SM': 'Ogyo',   // Side Mover
    'VM': 'Shugyo', // Vertical Mover
    'RC': 'Hensha', // Reverse Chariot
    'GB': 'Chunin', // Go-Between
    'CH': 'Chunin',
    'KR': 'Kirin',
    'PH': 'Ho_o',   // Phoenix
    'LN': 'Shishi', // Lion
    'FK': 'Hon_o',  // Free King
    'DK': 'Ryuou',  // Dragon King
    'DH': 'Ryume',  // Dragon Horse
    'PR': 'Taishi', // Prince
    'SE': 'Hiju',   // Soaring Eagle
    'HF': 'Kakuou', // Horned Falcon
    'WB': 'Hakuku', // White Horse
    'WH': 'Keigei', // Whale
    'FB': 'Honcho', // Free Boar
    'FO': 'Higyu',  // Flying Ox
    'FS': 'Hiroku', // Flying Stag
    'TO': 'Kinsho', // Promoted Pawn (Gold)
    'NY': 'Hakuku', // Promoted Lance (can be Gold in standard, but Hakuku in Chu?) 
    // Wait, Lance promotes to Hakuku (White Horse). 
    // Standard Shogi Promoted Lance is Narikyo (Gold).
    // Chu Shogi: Lance -> White Horse (Hakuku). Correct.
    'NK': 'Suizo',  // Promoted Go-Between (Drunk Elephant).
    'NG': 'Shugyo', // Promoted Silver (Vertical Mover).
    'NM': 'Kakugyo',// Promoted Leopard (Bishop).
    'NC': 'Ogyo'    // Promoted Copper (Side Mover).
};

// Reverse map for export (later)
const INTERNAL_TO_CSA: { [key: string]: string } = {};
for (const [k, v] of Object.entries(CSA_TO_INTERNAL)) {
    if (!INTERNAL_TO_CSA[v]) INTERNAL_TO_CSA[v] = k;
}

export interface CSAParseResult {
    initialBoard: BoardState;
    moves: {
        player: Player;
        from: Position;
        to: Position;
        pieceType: string;
        isPromoted?: boolean;
    }[];
    meta: { [key: string]: string };
}

function parseCoordinate(char: string): number {
    if (/[1-9]/.test(char)) return parseInt(char, 10);
    if (char === '0') return 10;
    if (char === 'A' || char === 'a') return 11;
    if (char === 'B' || char === 'b') return 12;
    return 0; // Error
}

export function parseCSA(csa: string): CSAParseResult {
    const lines = csa.split(/\r?\n/);
    const moves: CSAParseResult['moves'] = [];
    const meta: { [key: string]: string } = {};
    let board = createInitialBoard(); // Default start? CSA might specify PI

    // State
    // PI handling not implemented fully for custom boards yet, assuming standard start if PI omitted or matched.
    // If PI is present, we should parse it. For now, we assume standard start or just parse moves.

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('\'')) continue; // Comment

        if (trimmed.startsWith('N+')) {
            meta['Sente'] = trimmed.substring(2);
        } else if (trimmed.startsWith('N-')) {
            meta['Gote'] = trimmed.substring(2);
        } else if (trimmed.startsWith('$')) {
            // Meta info
            const parts = trimmed.split(':');
            if (parts.length >= 2) {
                meta[parts[0]] = parts[1];
            }
        } else if (trimmed.startsWith('+') || trimmed.startsWith('-')) {
            // Move: +12121112LN
            // Or +7776FU
            // Format: [+/-][X1][Y1][X2][Y2][PIECE]
            // Length: 1 + 1 + 1 + 1 + 1 + 2 = 7 chars usually for standard 9x9.
            // For Chu Shogi with A/B/0: Same length (7 chars).

            const player = trimmed.startsWith('+') ? 'sente' : 'gote';
            const content = trimmed.substring(1);

            let x1: number, y1: number, x2: number, y2: number;
            let pieceCode: string;

            if (content.length === 6) {
                // Standard 1-char (e.g. 7776FU, or A1A2LN)
                x1 = parseCoordinate(content[0]);
                y1 = parseCoordinate(content[1]);
                x2 = parseCoordinate(content[2]);
                y2 = parseCoordinate(content[3]);
                pieceCode = content.substring(4, 6);
            } else if (content.length === 10) {
                // Extended 2-char (e.g. 12121112LN or 08090808FU)
                x1 = parseInt(content.substring(0, 2), 10);
                y1 = parseInt(content.substring(2, 4), 10);
                x2 = parseInt(content.substring(4, 6), 10);
                y2 = parseInt(content.substring(6, 8), 10);
                pieceCode = content.substring(8, 10);
            } else {
                // Unknown format
                continue;
            }

            const internalPiece = CSA_TO_INTERNAL[pieceCode] || pieceCode; // Fallback to code if not found

            // Convert standard Shogi layout (1-based, Top-Right origin?)
            // CSA: 11 is 1st col from RIGHT, 1st row from TOP.
            // Chu Shogi Frontend: x=0 is LEFT, y=0 is TOP. (Based on RecordPage x=0..11)
            // Wait, standard Board implementation iterates x=11..0. 
            // x=0 is usually 12 (Right) in standard shogi?
            // Let's check Board.tsx:
            // "for (let x = 11; x >= 0; x--) { ... piece = board[y][x] }"
            // If board[y][0] is drawn at the END of the loop (Right side? No, standard HTML flow is L->R).
            // Grid is L->R.
            // x=11 down to 0. The first drawn item (Left visual) is x=11?
            // No, grid usually fills L->R.
            // If x loop goes 11..0, then the FIRST DIV is x=11.
            // So visual LEFT is x=11. Visual RIGHT is x=0.
            // This matches Shogi (1 is Right).
            // So internal x=0 is 1A (Top Right).
            // Internal coordinate matches CSA coordinate basically (x=1 -> array index 0).
            // y=1 -> array index 0.

            // CSA x: 1..12 (1 is Right).
            // Internal x: 0..11.
            // CSA x=1 => Internal x=0? 
            // In Shogi, 11 is 1st Col (Right).
            // If Board.tsx draws 11 first...
            // Visual Grid: [Cell x=11] [Cell x=10] ... [Cell x=0]
            // If 11 is Left, then 0 is Right.
            // CSA 1 = Right. So CSA x=1 maps to Internal x=0.
            // CSA 12 => x=11.
            // So mapping: internalX = csaX - 1;
            // AND internalY = csaY - 1;

            if (x1 === 0 && y1 === 0) {
                // Drop from hand? Not used in Chu Shogi usually?
                // Or maybe purely creating piece?
            }

            // CSA x=1 is Right. Internal x=0 is Right (col 1).
            // So Internal X = CSA X - 1.
            // CSA y=1 is Top. Internal y=0 is Top.
            // So Internal Y = CSA Y - 1.

            const fromPos = { x: x1 - 1, y: y1 - 1 };
            const toPos = { x: x2 - 1, y: y2 - 1 };

            moves.push({
                player,
                from: fromPos,
                to: toPos,
                pieceType: internalPiece
            });
        }
    }

    return { initialBoard: board, moves, meta };
}
