import type { BoardState, Piece, PieceType, Player, Position } from '../types';
import { BOARD_SIZE, isValidPos, PIECE_DATA } from './chuShogiRules';
import type { Direction } from './pieceData';

export interface InfluenceSquare {
    sente: number;
    gote: number;
}

export interface PositionEvaluation {
    material: {
        sente: number;
        gote: number;
        diff: number;
    };
    influence: {
        sente: number;
        gote: number;
        diff: number;
    };
    kingDanger: {
        sente: number;
        gote: number;
    };
    total: number;
    label: string;
    guide: string;
}

export const PIECE_VALUES: Record<PieceType, number> = {
    Fuhyo: 1.0,
    Chunin: 1.6,
    Dosho: 3.0,
    Ginsho: 3.4,
    Mohyo: 4.0,
    Kinsho: 4.4,
    Suizo: 5.9,
    Moko: 4.7,
    Kirin: 6.4,
    Ho_o: 5.7,
    Kyosha: 3.5,
    Hensha: 4.9,
    Ogyo: 6.4,
    Shugyo: 6.4,
    Kakugyo: 6.7,
    Hisha: 9.5,
    Ryume: 9.7,
    Ryuou: 12.1,
    Hon_o: 14.1,
    Shishi: 19.1,
    Ousho: 0,
    Taishi: 17.6,
    Hakuku: 7.0,
    Keigei: 7.0,
    Kakuou: 14.0,
    Hiju: 14.8,
    Honcho: 9.9,
    Higyu: 9.9,
    Hiroku: 7.6,
    Kinbisha: 8.4,
};

const MULTIPLE_ROYAL_DANGER_FACTOR = 0.6;

/**
 * Return the movement piece type currently used by a piece, including promotion.
 */
function getEffectivePieceType(piece: Piece): PieceType {
    const promotedType = PIECE_DATA[piece.type].promotedType;
    return piece.isPromoted && promotedType ? promotedType : piece.type;
}

/**
 * Convert a direction name into board deltas from the current player's point of view.
 */
function getVector(dir: Direction, player: Player): { dx: number; dy: number } {
    const vectors: Record<Direction, { dx: number; dy: number }> = {
        N: { dx: 0, dy: -1 },
        NE: { dx: 1, dy: -1 },
        E: { dx: 1, dy: 0 },
        SE: { dx: 1, dy: 1 },
        S: { dx: 0, dy: 1 },
        SW: { dx: -1, dy: 1 },
        W: { dx: -1, dy: 0 },
        NW: { dx: -1, dy: -1 },
    };
    const vector = vectors[dir];
    return player === 'sente' ? vector : { dx: -vector.dx, dy: -vector.dy };
}

/**
 * Add a target square once while keeping attack calculation deterministic.
 */
function addUniquePosition(positions: Position[], seen: Set<string>, pos: Position): void {
    const key = `${pos.x},${pos.y}`;
    if (!seen.has(key)) {
        seen.add(key);
        positions.push(pos);
    }
}

/**
 * Add one-step or jump influence; own pieces are included as defended squares.
 */
function addPointInfluence(positions: Position[], seen: Set<string>, from: Position, dx: number, dy: number): void {
    const target = { x: from.x + dx, y: from.y + dy };
    if (isValidPos(target)) {
        addUniquePosition(positions, seen, target);
    }
}

/**
 * Add sliding influence through empty squares and the first occupied square.
 */
function addRangeInfluence(
    board: BoardState,
    positions: Position[],
    seen: Set<string>,
    from: Position,
    dx: number,
    dy: number,
): void {
    let current = { x: from.x + dx, y: from.y + dy };
    while (isValidPos(current)) {
        addUniquePosition(positions, seen, current);
        if (board[current.y][current.x]) break;
        current = { x: current.x + dx, y: current.y + dy };
    }
}

/**
 * Return all squares controlled by one piece for display and evaluation.
 */
export function getInfluenceSquaresForPiece(board: BoardState, pos: Position): Position[] {
    const piece = board[pos.y][pos.x];
    if (!piece) return [];

    const effectiveType = getEffectivePieceType(piece);
    const moveData = PIECE_DATA[effectiveType].movement;
    const positions: Position[] = [];
    const seen = new Set<string>();
    if (!moveData) return positions;

    for (const dir of moveData.step || []) {
        const vector = getVector(dir, piece.owner);
        addPointInfluence(positions, seen, pos, vector.dx, vector.dy);
    }

    for (const dir of moveData.jump || []) {
        const vector = getVector(dir, piece.owner);
        addPointInfluence(positions, seen, pos, vector.dx * 2, vector.dy * 2);
    }

    for (const dir of moveData.range || []) {
        const vector = getVector(dir, piece.owner);
        addRangeInfluence(board, positions, seen, pos, vector.dx, vector.dy);
    }

    if (moveData.special === 'lion') {
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                if (dx !== 0 || dy !== 0) addPointInfluence(positions, seen, pos, dx, dy);
            }
        }
    }

    if (moveData.special === 'eagle') {
        for (const dir of ['NE', 'SE', 'SW', 'NW', 'E', 'W', 'S'] as Direction[]) {
            const vector = getVector(dir, piece.owner);
            addRangeInfluence(board, positions, seen, pos, vector.dx, vector.dy);
        }
        const vector = getVector('N', piece.owner);
        addPointInfluence(positions, seen, pos, vector.dx, vector.dy);
        addPointInfluence(positions, seen, pos, vector.dx * 2, vector.dy * 2);
    }

    if (moveData.special === 'falcon') {
        for (const dir of ['N', 'E', 'S', 'W', 'SE', 'SW'] as Direction[]) {
            const vector = getVector(dir, piece.owner);
            addRangeInfluence(board, positions, seen, pos, vector.dx, vector.dy);
        }
        for (const dir of ['NE', 'NW'] as Direction[]) {
            const vector = getVector(dir, piece.owner);
            addPointInfluence(positions, seen, pos, vector.dx, vector.dy);
            addPointInfluence(positions, seen, pos, vector.dx * 2, vector.dy * 2);
        }
    }

    return positions;
}

/**
 * Calculate board-wide influence counts for both players.
 */
export function calculateInfluenceMap(board: BoardState): InfluenceSquare[][] {
    const map: InfluenceSquare[][] = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => ({ sente: 0, gote: 0 })),
    );

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const piece = board[y][x];
            if (!piece) continue;
            for (const target of getInfluenceSquaresForPiece(board, { x, y })) {
                map[target.y][target.x][piece.owner] += 1;
            }
        }
    }

    return map;
}

/**
 * Return the point value of a piece in its current promoted or unpromoted state.
 */
function getPieceValue(piece: Piece): number {
    return PIECE_VALUES[getEffectivePieceType(piece)] || 0;
}

/**
 * Sum material values for both players.
 */
function calculateMaterial(board: BoardState): { sente: number; gote: number } {
    const material = { sente: 0, gote: 0 };
    for (const row of board) {
        for (const piece of row) {
            if (piece) material[piece.owner] += getPieceValue(piece);
        }
    }
    return material;
}

/**
 * Sum influence counts for both players.
 */
function calculateInfluenceTotals(influenceMap: InfluenceSquare[][]): { sente: number; gote: number } {
    return influenceMap.flat().reduce(
        (total, square) => ({
            sente: total.sente + square.sente,
            gote: total.gote + square.gote,
        }),
        { sente: 0, gote: 0 },
    );
}

/**
 * Find royal pieces that should be treated as king-safety anchors.
 */
function findRoyalPositions(board: BoardState, player: Player): Position[] {
    const positions: Position[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const piece = board[y][x];
            if (!piece || piece.owner !== player) continue;
            const effectiveType = getEffectivePieceType(piece);
            if (effectiveType === 'Ousho' || effectiveType === 'Taishi') {
                positions.push({ x, y });
            }
        }
    }
    return positions;
}

/**
 * Estimate pressure around one royal piece from the opponent's influence.
 */
function calculateRoyalDanger(influenceMap: InfluenceSquare[][], royal: Position, opponent: Player): number {
    let danger = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const target = { x: royal.x + dx, y: royal.y + dy };
            if (isValidPos(target)) danger += influenceMap[target.y][target.x][opponent];
        }
    }
    return danger;
}

/**
 * Estimate royal pressure, discounting danger when king and prince both exist.
 */
function calculateKingDanger(board: BoardState, influenceMap: InfluenceSquare[][], player: Player): number {
    const opponent: Player = player === 'sente' ? 'gote' : 'sente';
    const royalDangers = findRoyalPositions(board, player).map((royal) =>
        calculateRoyalDanger(influenceMap, royal, opponent),
    );
    if (royalDangers.length === 0) return 0;
    if (royalDangers.length === 1) return royalDangers[0];
    return Math.max(...royalDangers) * MULTIPLE_ROYAL_DANGER_FACTOR;
}

/**
 * Convert a numeric evaluation into a compact Japanese label.
 */
function getEvaluationLabel(total: number): string {
    const abs = Math.abs(total);
    const side = total >= 0 ? '先手' : '後手';
    if (abs < 1.5) return '互角';
    if (abs < 5) return `${side}やや良し`;
    if (abs < 10) return `${side}良し`;
    return `${side}優勢`;
}

/**
 * Build a short guide sentence from the main evaluation components.
 */
function getGuide(materialDiff: number, influenceDiff: number, senteDanger: number, goteDanger: number): string {
    const notes: string[] = [];
    if (Math.abs(materialDiff) >= 2) notes.push(materialDiff > 0 ? '先手が駒得です' : '後手が駒得です');
    if (Math.abs(influenceDiff) >= 8) notes.push(influenceDiff > 0 ? '先手の利きが広いです' : '後手の利きが広いです');
    if (senteDanger - goteDanger >= 4) notes.push('先手玉周辺に圧力があります');
    if (goteDanger - senteDanger >= 4) notes.push('後手玉周辺に圧力があります');
    return notes.length > 0 ? notes.join('。') : '大きな差はありません';
}

/**
 * Evaluate the current board using material, influence, and royal pressure.
 */
export function evaluatePosition(board: BoardState, influenceMap: InfluenceSquare[][]): PositionEvaluation {
    const material = calculateMaterial(board);
    const influence = calculateInfluenceTotals(influenceMap);
    const senteDanger = calculateKingDanger(board, influenceMap, 'sente');
    const goteDanger = calculateKingDanger(board, influenceMap, 'gote');
    const materialDiff = material.sente - material.gote;
    const influenceDiff = influence.sente - influence.gote;
    const dangerDiff = goteDanger - senteDanger;
    const total = materialDiff + influenceDiff * 0.05 + dangerDiff * 0.25;

    return {
        material: { ...material, diff: materialDiff },
        influence: { ...influence, diff: influenceDiff },
        kingDanger: { sente: senteDanger, gote: goteDanger },
        total,
        label: getEvaluationLabel(total),
        guide: getGuide(materialDiff, influenceDiff, senteDanger, goteDanger),
    };
}
