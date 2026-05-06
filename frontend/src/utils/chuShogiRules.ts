import type { Piece, PieceType, Player, Position, BoardState } from '../types';

export const BOARD_SIZE = 12;

// Standard Chu Shogi Initial Setup
// Standard Chu Shogi Initial Setup (46 pieces each)
export const INITIAL_BOARD_TYPES: (PieceType | null)[][] = [
    // GOTE (Top, Rows 0-4)
    // Rank 1 (12)
    ['Kyosha', 'Mohyo', 'Dosho', 'Ginsho', 'Kinsho', 'Ousho', 'Suizo', 'Kinsho', 'Ginsho', 'Dosho', 'Mohyo', 'Kyosha'],
    // Rank 2 (11)
    ['Hensha', null, 'Kakugyo', null, 'Moko', 'Kirin', 'Ho_o', 'Moko', null, 'Kakugyo', null, 'Hensha'],
    // Rank 3 (10)
    ['Ogyo', 'Shugyo', 'Hisha', 'Ryume', 'Ryuou', 'Shishi', 'Hon_o', 'Ryuou', 'Ryume', 'Hisha', 'Shugyo', 'Ogyo'],
    // Rank 4 (9)
    ['Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo'],
    // Rank 5 (8)
    [null, null, null, 'Chunin', null, null, null, null, 'Chunin', null, null, null],

    // Empty Zone (Rows 5-6)
    Array(12).fill(null),
    Array(12).fill(null),

    // SENTE (Bottom, Rows 7-11)
    // Rank 8
    [null, null, null, 'Chunin', null, null, null, null, 'Chunin', null, null, null],
    // Rank 9
    ['Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo', 'Fuhyo'],
    // Rank 10
    ['Ogyo', 'Shugyo', 'Hisha', 'Ryume', 'Ryuou', 'Hon_o', 'Shishi', 'Ryuou', 'Ryume', 'Hisha', 'Shugyo', 'Ogyo'],
    // Rank 11
    ['Hensha', null, 'Kakugyo', null, 'Moko', 'Ho_o', 'Kirin', 'Moko', null, 'Kakugyo', null, 'Hensha'],
    // Rank 12
    ['Kyosha', 'Mohyo', 'Dosho', 'Ginsho', 'Kinsho', 'Suizo', 'Ousho', 'Kinsho', 'Ginsho', 'Dosho', 'Mohyo', 'Kyosha'],
];

export function createInitialBoard(): BoardState {
    // Map types to Piece objects
    return INITIAL_BOARD_TYPES.map((row, y) => {
        return row.map((type) => {
            if (!type) return null;
            // Determine owner: Top half (y < 6) is Gote, Bottom is Sente
            const owner: Player = y < 6 ? 'gote' : 'sente';
            return {
                type,
                owner,
                isPromoted: false
            };
        });
    });
}

import { PIECE_DATA } from './pieceData';
import type { Direction } from './pieceData';

// Re-export PIECE_DATA for external use
export { PIECE_DATA };

// Helper to check bounds
export function isValidPos(pos: Position): boolean {
    return pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE;
}

// Helper to check if position is in promotion zone
function isInPromotionZone(pos: Position, player: Player): boolean {
    if (player === 'sente') {
        return pos.y <= 3; // Top 4 rows for Sente
    } else {
        return pos.y >= 8; // Bottom 4 rows for Gote (8,9,10,11)
    }
}

// Check if promotion is allowed
export function canPromote(piece: Piece, from: Position, to: Position, captured: boolean): boolean {
    if (piece.isPromoted) return false;
    const pData = PIECE_DATA[piece.type];
    if (!pData.promotedType) return false;

    const fromIn = isInPromotionZone(from, piece.owner);
    const toIn = isInPromotionZone(to, piece.owner);

    // 1. Enter Zone
    if (!fromIn && toIn) return true;

    // 2. Within Zone with Capture
    if (fromIn && toIn && captured) return true;

    // 3. Leave Zone -> False (User Rule)
    // 4. Within Zone without Capture -> False (User Rule)

    return false;
}

// Direction vectors (x, y) - Sente View
function getVector(dir: Direction, player: Player): { dx: number, dy: number } {
    // Sente: N=(0, -1), S=(0, 1), E=(1, 0), W=(-1, 0)
    // Gote: Rotate 180
    const signs: Record<Direction, { x: number, y: number }> = {
        'N': { x: 0, y: -1 },
        'S': { x: 0, y: 1 },
        'E': { x: 1, y: 0 },
        'W': { x: -1, y: 0 },
        'NE': { x: 1, y: -1 },
        'NW': { x: -1, y: -1 },
        'SE': { x: 1, y: 1 },
        'SW': { x: -1, y: 1 }
    };

    const v = signs[dir];
    if (player === 'sente') {
        return { dx: v.x, dy: v.y };
    } else {
        return { dx: -v.x, dy: -v.y };
    }
}

// Check if a move is legal
export function getLegalMoves(board: BoardState, pos: Position, player: Player): Position[] {
    const piece = board[pos.y][pos.x];
    if (!piece || piece.owner !== player) return [];

    let moveData = PIECE_DATA[piece.type].movement;

    if (piece.isPromoted) {
        const pType = PIECE_DATA[piece.type].promotedType;
        if (pType) {
            moveData = PIECE_DATA[pType].movement;
        }
    }

    if (!moveData) return [];

    const moves: Position[] = [];

    // Helper to add moves (avoids duplication logic for mixed types?)
    // Actually, simple push is fine, but special lion moves might cover step squares.
    // Set to handle distinct.
    const uniqueMoves = new Set<string>();
    const addMove = (p: Position) => {
        const key = `${p.x},${p.y}`;
        if (!uniqueMoves.has(key)) {
            uniqueMoves.add(key);
            moves.push(p);
        }
    };

    // 1. Steps
    if (moveData.step) {
        for (const dir of moveData.step) {
            const v = getVector(dir, player);
            const target = { x: pos.x + v.dx, y: pos.y + v.dy };
            if (isValidPos(target)) {
                const targetPiece = board[target.y][target.x];
                if (!targetPiece || targetPiece.owner !== player) {
                    addMove(target);
                }
            }
        }
    }

    // 2. Ranges
    if (moveData.range) {
        for (const dir of moveData.range) {
            const v = getVector(dir, player);
            let current = { x: pos.x + v.dx, y: pos.y + v.dy };
            while (isValidPos(current)) {
                const targetPiece = board[current.y][current.x];
                if (!targetPiece) {
                    addMove(current);
                } else {
                    if (targetPiece.owner !== player) {
                        addMove(current);
                    }
                    break;
                }
                current = { x: current.x + v.dx, y: current.y + v.dy };
            }
        }
    }

    // 3. Jumps
    if (moveData.jump) {
        for (const dir of moveData.jump) {
            const v = getVector(dir, player);
            const target = { x: pos.x + v.dx * 2, y: pos.y + v.dy * 2 };
            if (isValidPos(target)) {
                const targetPiece = board[target.y][target.x];
                if (!targetPiece || targetPiece.owner !== player) {
                    addMove(target);
                }
            }
        }
    }

    // 4. Special
    if (moveData.special) {
        if (moveData.special === 'lion') {
            // Lion 5x5
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const target = { x: pos.x + dx, y: pos.y + dy };
                    if (isValidPos(target)) {
                        const targetPiece = board[target.y][target.x];
                        if (!targetPiece || targetPiece.owner !== player) {
                            addMove(target);
                        }
                    }
                }
            }
        } else if (moveData.special === 'eagle') {
            // Horned Falcon: Range Diagonals (all) + Range Side/Back (E,W,S) + Lion Move Front (N)
            const rangeDirs: Direction[] = ['NE', 'SE', 'SW', 'NW', 'E', 'W', 'S'];
            for (const dir of rangeDirs) {
                const v = getVector(dir, player);
                let current = { x: pos.x + v.dx, y: pos.y + v.dy };
                while (isValidPos(current)) {
                    const targetPiece = board[current.y][current.x];
                    if (!targetPiece) {
                        addMove(current);
                    } else {
                        if (targetPiece.owner !== player) addMove(current);
                        break;
                    }
                    current = { x: current.x + v.dx, y: current.y + v.dy };
                }
            }

            // Lion Move in Front (N)
            const vN = getVector('N', player);
            const t1 = { x: pos.x + vN.dx, y: pos.y + vN.dy };
            if (isValidPos(t1)) {
                const p1 = board[t1.y][t1.x];
                if (!p1 || p1.owner !== player) addMove(t1);
            }
            const t2 = { x: pos.x + vN.dx * 2, y: pos.y + vN.dy * 2 };
            if (isValidPos(t2)) {
                const p2 = board[t2.y][t2.x];
                if (!p2 || p2.owner !== player) addMove(t2);
            }

        } else if (moveData.special === 'falcon') {
            // Soaring Eagle: Range Orthogonal (all) + Range Back-Diagonals (SE, SW) + Lion Diagonals Forward (NE, NW)
            const rangeDirs: Direction[] = ['N', 'E', 'S', 'W', 'SE', 'SW'];
            for (const dir of rangeDirs) {
                const v = getVector(dir, player);
                let current = { x: pos.x + v.dx, y: pos.y + v.dy };
                while (isValidPos(current)) {
                    const targetPiece = board[current.y][current.x];
                    if (!targetPiece) {
                        addMove(current);
                    } else {
                        if (targetPiece.owner !== player) addMove(current);
                        break;
                    }
                    current = { x: current.x + v.dx, y: current.y + v.dy };
                }
            }

            // Lion Diagonals (NE, NW)
            const lionDirs: Direction[] = ['NE', 'NW'];
            for (const dir of lionDirs) {
                const v = getVector(dir, player);
                const t1 = { x: pos.x + v.dx, y: pos.y + v.dy };
                if (isValidPos(t1)) {
                    const p1 = board[t1.y][t1.x];
                    if (!p1 || p1.owner !== player) addMove(t1);
                }
                const t2 = { x: pos.x + v.dx * 2, y: pos.y + v.dy * 2 };
                if (isValidPos(t2)) {
                    const p2 = board[t2.y][t2.x];
                    if (!p2 || p2.owner !== player) addMove(t2);
                }
            }
        }
    }

    return moves;
}

// Check if a move (dx, dy) allows a second step (Lion Power)
export function hasLionPower(piece: Piece, dx: number, dy: number): boolean {
    let pData = PIECE_DATA[piece.type];
    
    // If promoted, we must look at the promoted type's data
    if (piece.isPromoted) {
        const pType = pData.promotedType;
        if (pType && PIECE_DATA[pType]) {
            pData = PIECE_DATA[pType];
        }
    }
    
    const special = pData.movement?.special;

    // 1. Lion: All adjacent moves trigger 2nd step
    if (special === 'lion') return true;

    // 2. Soaring Eagle (Hiju): Forward Diagonals
    if (special === 'falcon') { // Note: 'falcon' key is for Hiju (Soaring Eagle) in my PIECE_DATA comments
        // Hiju (Soaring Eagle) has special='falcon'.
        // Directions: NE, NW (Sente).
        // Sente: NE=(1, -1), NW=(-1, -1).
        // Gote: NE=(-1, 1), NW=(1, 1).

        // Normalize to Sente view for checking
        let approachDy = dy;
        let approachDx = dx;
        if (piece.owner === 'gote') {
            approachDy = -dy;
            approachDx = -dx;
        }

        // Forward Diagonals: dy = -1, abs(dx) = 1
        if (approachDy === -1 && Math.abs(approachDx) === 1) return true;
    }

    // 3. Horned Falcon (Kakuou): Forward Orthogonal
    if (special === 'eagle') { // Note: 'eagle' key is for Kakuou inside PIECE_DATA.
        // Directions: N (Sente).

        let approachDy = dy;
        let approachDx = dx;
        if (piece.owner === 'gote') {
            approachDy = -dy;
            approachDx = -dx;
        }

        // Forward: dy = -1, dx = 0
        if (approachDy === -1 && approachDx === 0) return true;
    }

    return false;
}

