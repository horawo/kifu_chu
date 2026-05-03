import React from 'react';
import type { BoardState, Position, Player } from '../types';
import Piece from './Piece';
// import { isValidPos } from '../utils/chuShogiRules'; // Unused

interface BoardProps {
    board: BoardState;
    onSquareClick: (pos: Position) => void;
    selectedPos: Position | null;
    validMoves: Position[];
    currentPlayer: Player;
    promotionCandidate?: {
        pos: Position;
        piece: any; // Using any for simplicity in import, but should be Piece
        onConfirm: (promote: boolean) => void;
    } | null;
}

const Board: React.FC<BoardProps> = ({ board, onSquareClick, selectedPos, validMoves, promotionCandidate }) => {
    // 12 columns, 12 rows
    const styles: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 48px)', // サブピクセル丸め誤差を防ぐための完全固定値
        gridTemplateRows: 'repeat(12, 48px)',    // 同上
        width: '587px', // 48px * 12 + 1px(gap) * 11
        height: '587px',
        border: '4px solid #3e2723',
        backgroundColor: '#8d6e63', // 隙間（gap）が枠線の色として見えるようになる
        gap: '1px', // これが1pxの枠線として機能する
        position: 'relative', // For absolute positioning if needed
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none'
    };

    const cellStyle = (x: number, y: number): React.CSSProperties => {
        const isSelected = selectedPos && selectedPos.x === x && selectedPos.y === y;
        const isValidMove = validMoves.some(m => m.x === x && m.y === y);

        // 基本の盤面色（#deb887）の上に、ハイライト色を半透明で重ねる（gap枠線を隠さないため）
        let background = '#deb887';
        if (isSelected) {
            background = 'linear-gradient(rgba(255, 235, 59, 0.5), rgba(255, 235, 59, 0.5)), #deb887';
        } else if (isValidMove) {
            background = 'linear-gradient(rgba(100, 255, 100, 0.3), rgba(100, 255, 100, 0.3)), #deb887';
        }

        return {
            width: '100%',
            height: '100%',
            background: background,
            // border: '1px solid #8d6e63', ← この指定がガタつきの原因だったため削除
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none'
        };
    };

    // Modal Overlay Component (Inline for now)
    const renderPromotionModal = () => {
        if (!promotionCandidate) return null;
        const { pos, piece, onConfirm } = promotionCandidate;

        // Position Logic: Top-Right of the TARGET piece?
        // Since we are rendering inside the grid map, if we just render it IN the cell, z-index it.
        // We'll calculate the "top right" style relative to the cell container.

        return (
            <div style={{
                position: 'absolute',
                top: '-80%',
                left: '80%',
                zIndex: 100,
                backgroundColor: 'white',
                border: '2px solid black',
                padding: '5px',
                display: 'flex',
                gap: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                borderRadius: '8px',
                width: '120px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onConfirm(false); }}>
                    <div style={{ width: '40px', height: '40px', position: 'relative' }}>
                        <Piece piece={{ ...piece, isPromoted: false }} />
                    </div>
                    <span style={{ fontSize: '0.7em' }}>不成</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onConfirm(true); }}>
                    <div style={{ width: '40px', height: '40px', position: 'relative' }}>
                        <Piece piece={{ ...piece, isPromoted: true }} />
                    </div>
                    <span style={{ fontSize: '0.7em', color: 'red' }}>成</span>
                </div>
            </div>
        );
    };

    // Generate grid
    const grid = [];
    for (let y = 0; y < 12; y++) {
        for (let x = 11; x >= 0; x--) {
            const piece = board[y][x];
            // Check if this cell is the promotion target
            const isPromotionTarget = promotionCandidate && promotionCandidate.pos.x === x && promotionCandidate.pos.y === y;

            grid.push(
                <div
                    key={`${x} -${y} `}
                    style={cellStyle(x, y)}
                    onClick={() => {
                        // Block click if modal is open? Or maybe modal closes?
                        // If logic in parent handles click, fine.
                        if (!promotionCandidate) onSquareClick({ x, y });
                    }}
                >
                    {piece && (
                        <Piece
                            key={`${piece.owner}-${piece.type}-${piece.isPromoted}`}
                            piece={piece}
                            isSelected={selectedPos?.x === x && selectedPos?.y === y}
                        />
                    )}
                    {isPromotionTarget && renderPromotionModal()}
                </div>
            );
        }
    }

    const topLabels = ['十二', '十一', '十', '九', '八', '七', '六', '五', '四', '三', '二', '一'];
    const rightLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* 上部座標（漢数字 十二～一） */}
            <div style={{ display: 'flex', width: '587px', marginLeft: '4px', marginBottom: '2px', userSelect: 'none', pointerEvents: 'none' }}>
                {topLabels.map((lbl, i) => (
                    <div key={i} style={{ width: '48px', marginRight: i < 11 ? '1px' : '0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '9px', fontWeight: 'bold', color: '#555' }}>
                        {lbl.length === 2 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1', alignItems: 'center' }}>
                                <span>{lbl[0]}</span>
                                <span>{lbl[1]}</span>
                            </div>
                        ) : (
                            <span>{lbl}</span>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex' }}>
                {/* 盤面グリッド */}
                <div style={styles}>
                    {grid}
                </div>

                {/* 右部座標（算用数字 1～12） */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '587px', marginTop: '4px', marginLeft: '2px', userSelect: 'none', pointerEvents: 'none' }}>
                    {rightLabels.map((lbl, i) => (
                        <div key={i} style={{ height: '48px', marginBottom: i < 11 ? '1px' : '0', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: '2px', fontSize: '9px', fontWeight: 'bold', color: '#555' }}>
                            {lbl}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Board;
