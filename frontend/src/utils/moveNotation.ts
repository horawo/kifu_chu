import type { Position, Move, Piece } from '../types';
import { PIECE_DATA } from './pieceData';

// Convert internal coordinates (0-11) to display coordinates
// File (筋): 12-pos.x (right=1, left=12)
// Rank (段): kanji (top=一, bottom=十二)
export function formatCoordinate(pos: Position): string {
    const fileNum = 12 - pos.x; // 0->12, 11->1
    const rankKanji = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][pos.y];
    return `${fileNum}${rankKanji}`;
}

// Get piece name in kanji
export function getPieceName(piece: Piece): string {
    const data = PIECE_DATA[piece.type];
    if (piece.isPromoted && data.promotedType) {
        const promotedData = PIECE_DATA[data.promotedType];
        return promotedData.kanji;
    }
    return data.kanji;
}

// Format a move as kifu notation: {▲/△}{to}{piece}({from})
// Example: ▲7六歩(77)
export function formatMove(move: Move, moveNumber: number): string {
    const owner = move.piece.owner || (move.piece as any).player;
    const playerMark = owner === 'sente' ? '▲' : '▽';
    const toCoord = formatCoordinate(move.to);
    const fromCoord = formatCoordinate(move.from);
    const pieceName = getPieceName(move.piece);

    return `${moveNumber}. ${playerMark}${toCoord}${pieceName}(${fromCoord})`;
}
