import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Board, Player, PieceType } from '../types';
import Piece from '../components/Piece';
import { PIECE_DATA } from '../utils/chuShogiRules';
import { createInitialBoard } from '../utils/chuShogiRules';
import SaveInitialDialog from '../components/SaveInitialDialog';

// Piece limit configuration (per player)
const PIECE_LIMITS: Record<PieceType, { maxCount: number; promotionChain: PieceType[] }> = {
    Ousho: { maxCount: 1, promotionChain: ['Ousho'] },
    Kinsho: { maxCount: 2, promotionChain: ['Kinsho', 'Kinbisha'] },
    Ginsho: { maxCount: 2, promotionChain: ['Ginsho', 'Shugyo'] },
    Dosho: { maxCount: 2, promotionChain: ['Dosho', 'Ogyo'] },
    Mohyo: { maxCount: 2, promotionChain: ['Mohyo', 'Kakugyo'] },
    Moko: { maxCount: 2, promotionChain: ['Moko', 'Hiroku'] },
    Suizo: { maxCount: 1, promotionChain: ['Suizo', 'Taishi'] },
    Chunin: { maxCount: 2, promotionChain: ['Chunin', 'Suizo'] },
    Fuhyo: { maxCount: 12, promotionChain: ['Fuhyo', 'Kinsho'] },
    Kyosha: { maxCount: 2, promotionChain: ['Kyosha', 'Hakuku'] },
    Hensha: { maxCount: 2, promotionChain: ['Hensha', 'Keigei'] },
    Hisha: { maxCount: 2, promotionChain: ['Hisha', 'Ryuou'] },
    Kakugyo: { maxCount: 2, promotionChain: ['Kakugyo', 'Ryume'] },
    Ryume: { maxCount: 2, promotionChain: ['Ryume', 'Kakuou'] },
    Ryuou: { maxCount: 2, promotionChain: ['Ryuou', 'Hiju'] },
    Ogyo: { maxCount: 2, promotionChain: ['Ogyo', 'Honcho'] },
    Shugyo: { maxCount: 2, promotionChain: ['Shugyo', 'Higyu'] },
    Kirin: { maxCount: 1, promotionChain: ['Kirin', 'Shishi'] },
    Ho_o: { maxCount: 1, promotionChain: ['Ho_o', 'Hon_o'] },
    Shishi: { maxCount: 1, promotionChain: ['Shishi'] },
    Hon_o: { maxCount: 1, promotionChain: ['Hon_o'] },
    // Promoted-only pieces (not placed directly, but counted)
    Taishi: { maxCount: 1, promotionChain: ['Suizo', 'Taishi'] },
    Hakuku: { maxCount: 2, promotionChain: ['Kyosha', 'Hakuku'] },
    Keigei: { maxCount: 2, promotionChain: ['Hensha', 'Keigei'] },
    Kakuou: { maxCount: 2, promotionChain: ['Ryume', 'Kakuou'] },
    Hiju: { maxCount: 2, promotionChain: ['Ryuou', 'Hiju'] },
    Honcho: { maxCount: 2, promotionChain: ['Ogyo', 'Honcho'] },
    Higyu: { maxCount: 2, promotionChain: ['Shugyo', 'Higyu'] },
    Hiroku: { maxCount: 2, promotionChain: ['Moko', 'Hiroku'] },
    Kinbisha: { maxCount: 2, promotionChain: ['Kinsho', 'Kinbisha'] }
};

// Helper function to count pieces on board
const countPiecesOnBoard = (
    board: Board,
    player: Player,
    pieceTypes: PieceType[]
): number => {
    let count = 0;
    for (const row of board) {
        for (const cell of row) {
            if (cell && cell.owner === player && pieceTypes.includes(cell.type)) {
                count++;
            }
        }
    }
    return count;
};

// Piece palette showing all available pieces
interface PiecePaletteProps {
    selectedPiece: { type: PieceType; owner: Player } | null;
    onSelectPiece: (type: PieceType, owner: Player) => void;
    board: Board;
    limitEnabled: boolean;
}

const PiecePalette: React.FC<PiecePaletteProps> = ({ selectedPiece, onSelectPiece, board, limitEnabled }) => {
    const [activePlayer, setActivePlayer] = useState<Player>('sente');

    // Pieces that are promoted forms only (should not appear in palette)
    const promotedOnlyPieces: PieceType[] = [
        'Taishi', 'Hakuku', 'Keigei', 'Kakuou', 'Hiju', 'Honcho', 'Higyu', 'Hiroku', 'Kinbisha'
    ];

    // All piece types from PIECE_DATA, excluding promoted-only pieces
    const allPieceTypes = Object.keys(PIECE_DATA) as PieceType[];
    const pieceTypes = allPieceTypes.filter(type => !promotedOnlyPieces.includes(type));

    // Check if a piece can be placed
    const canPlacePiece = (type: PieceType, player: Player): boolean => {
        if (!limitEnabled) return true;

        const limit = PIECE_LIMITS[type];
        if (!limit) return true;

        const currentCount = countPiecesOnBoard(board, player, limit.promotionChain);
        return currentCount < limit.maxCount;
    };

    // Get current count and limit for a piece
    const getPieceCount = (type: PieceType, player: Player): { current: number; max: number } => {
        const limit = PIECE_LIMITS[type];
        if (!limit) return { current: 0, max: 999 };

        const current = countPiecesOnBoard(board, player, limit.promotionChain);
        return { current, max: limit.maxCount };
    };

    return (
        <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            minWidth: '250px',
            maxWidth: '300px'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>駒パレット</h3>

            {/* Player tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                    onClick={() => setActivePlayer('sente')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '14px',
                        fontWeight: activePlayer === 'sente' ? '600' : '400',
                        backgroundColor: activePlayer === 'sente' ? '#667eea' : '#e0e0e0',
                        color: activePlayer === 'sente' ? '#fff' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    先手
                </button>
                <button
                    onClick={() => setActivePlayer('gote')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '14px',
                        fontWeight: activePlayer === 'gote' ? '600' : '400',
                        backgroundColor: activePlayer === 'gote' ? '#667eea' : '#e0e0e0',
                        color: activePlayer === 'gote' ? '#fff' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    後手
                </button>
            </div>

            {/* Piece grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                maxHeight: '600px',
                overflowY: 'auto'
            }}>
                {pieceTypes.map(type => {
                    const isSelected = selectedPiece?.type === type && selectedPiece?.owner === activePlayer;
                    const pieceData = PIECE_DATA[type];
                    const canPlace = canPlacePiece(type, activePlayer);
                    const count = getPieceCount(type, activePlayer);
                    const isDisabled = limitEnabled && !canPlace;

                    return (
                        <button
                            key={type}
                            onClick={() => !isDisabled && onSelectPiece(type, activePlayer)}
                            disabled={isDisabled}
                            title={limitEnabled ? `${count.current}/${count.max}` : undefined}
                            style={{
                                padding: '8px 4px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                backgroundColor: isSelected ? '#667eea' : (isDisabled ? '#e0e0e0' : '#fff'),
                                color: isSelected ? '#fff' : (isDisabled ? '#999' : '#333'),
                                border: isSelected ? '2px solid #5568d3' : '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: isDisabled ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected && !isDisabled) e.currentTarget.style.backgroundColor = '#f0f0f0';
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected && !isDisabled) e.currentTarget.style.backgroundColor = '#fff';
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', position: 'relative' }}>
                                <Piece piece={{ type, owner: activePlayer, isPromoted: false }} />
                            </div>
                            {limitEnabled && <div style={{ fontSize: '10px', marginTop: '2px', color: isDisabled ? '#999' : '#666' }}>
                                {count.current}/{count.max}
                            </div>}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                ※ クリックで駒を選択し、盤面に配置できます
            </div>
        </div>
    );
};

const InitialSetupPage: React.FC = () => {
    const [board, setBoard] = useState<Board>(Array(12).fill(null).map(() => Array(12).fill(null)));
    const [selectedPiece, setSelectedPiece] = useState<{ type: PieceType; owner: Player } | null>(null);
    const [limitEnabled, setLimitEnabled] = useState<boolean>(true);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [currentInitialId, setCurrentInitialId] = useState<number | null>(null);
    const [currentInitialName, setCurrentInitialName] = useState<string>('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleCellClick = (y: number, x: number) => {
        const newBoard = board.map(row => [...row]);

        if (newBoard[y][x]) {
            // Remove piece
            newBoard[y][x] = null;
        } else if (selectedPiece) {
            // Check if we can place the piece (if limits are enabled)
            if (limitEnabled) {
                const limit = PIECE_LIMITS[selectedPiece.type];
                if (limit) {
                    const currentCount = countPiecesOnBoard(board, selectedPiece.owner, limit.promotionChain);
                    if (currentCount >= limit.maxCount) {
                        alert(`この駒は上限に達しています (${currentCount}/${limit.maxCount})`);
                        return;
                    }
                }
            }

            // Place selected piece
            newBoard[y][x] = {
                type: selectedPiece.type,
                owner: selectedPiece.owner,
                isPromoted: false
            };
        }

        setBoard(newBoard);
    };

    const handleCellRightClick = (e: React.MouseEvent, y: number, x: number) => {
        e.preventDefault();
        const piece = board[y][x];
        if (!piece) return;

        const pieceData = PIECE_DATA[piece.type];

        // Prevent promotion if this piece is already promoted
        if (piece.isPromoted) {
            // Already promoted, cannot promote further
            return;
        }

        // Check if this piece can promote
        if (pieceData.promotedType) {
            // Promote: set isPromoted flag to true
            const newBoard = board.map(row => [...row]);
            newBoard[y][x] = {
                type: pieceData.promotedType,
                owner: piece.owner,
                isPromoted: true // Mark as promoted
            };
            setBoard(newBoard);
        }
    };

    // Load initial setup from location state (when editing)
    useEffect(() => {
        const state = location.state as { loadInitialId?: number } | null;
        if (state?.loadInitialId) {
            loadInitialSetup(state.loadInitialId);
        }
    }, [location.state]);

    const loadInitialSetup = async (initialId: number) => {
        try {
            const response = await fetch(`http://localhost:8080/api/initial.php?action=get&initial_id=${initialId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success && data.data) {
                setBoard(data.data.board);
                setCurrentInitialId(initialId);
                setCurrentInitialName(data.data.initial_name);
            } else {
                alert('初期配置の読み込みに失敗しました');
            }
        } catch (error) {
            console.error('Failed to load initial setup:', error);
            alert('初期配置の読み込みに失敗しました');
        }
    };

    const handleSave = async (name: string) => {
        try {
            const response = await fetch('http://localhost:8080/api/initial.php?action=save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    initial_id: currentInitialId,
                    initial_name: name,
                    board: board
                })
            });
            const data = await response.json();
            if (data.success) {
                setCurrentInitialId(data.initial_id);
                setCurrentInitialName(name);
                alert(currentInitialId ? '更新しました' : '保存しました');
            } else {
                throw new Error(data.error || '保存に失敗しました');
            }
        } catch (error) {
            throw error;
        }
    };

    const loadStandardSetup = () => {
        setBoard(createInitialBoard());
        // Reset current initial ID when loading standard setup
        setCurrentInitialId(null);
        setCurrentInitialName('');
    };

    const clearBoard = () => {
        setBoard(Array(12).fill(null).map(() => Array(12).fill(null)));
        // Reset current initial ID when clearing
        setCurrentInitialId(null);
        setCurrentInitialName('');
    };

    const startRecording = () => {
        // Navigate to RecordPage with custom board
        navigate('/record/1', { state: { customBoard: board } });
    };

    const handleGoToList = () => {
        navigate('/initial');
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '80px 20px 20px 20px',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <h1 style={{
                    marginBottom: '20px',
                    fontSize: '28px',
                    color: '#333'
                }}>
                    初期配置作成
                </h1>

                <div style={{ display: 'flex', gap: '24px' }}>
                    {/* Board */}
                    <div>
                        <div style={{
                            display: 'inline-grid',
                            gridTemplateColumns: `repeat(12, 48px)`,
                            gap: '1px',
                            backgroundColor: '#000',
                            border: '2px solid #000',
                            borderRadius: '4px'
                        }}>
                            {board.map((row, y) =>
                                row.map((piece, x) => (
                                    <div
                                        key={`${y}-${x}`}
                                        onClick={() => handleCellClick(y, x)}
                                        onContextMenu={(e) => handleCellRightClick(e, y, x)}
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: '#f0d9b5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            color: '#333',
                                            position: 'relative',
                                            userSelect: 'none'
                                        }}
                                    >
                                        {piece && (
                                            <Piece piece={piece} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setIsSaveDialogOpen(true)}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    backgroundColor: '#667eea',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {currentInitialId ? '更新' : '保存'}
                            </button>
                            <button
                                onClick={handleGoToList}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    backgroundColor: '#17a2b8',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                一覧
                            </button>
                            <button
                                onClick={loadStandardSetup}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    backgroundColor: '#28a745',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                中将棋標準配置
                            </button>
                            <button
                                onClick={clearBoard}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    backgroundColor: '#6c757d',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                盤面クリア
                            </button>
                            <button
                                onClick={startRecording}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    backgroundColor: '#fd7e14',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                この配置で採譜開始
                            </button>
                        </div>

                        {currentInitialName && (
                            <div style={{
                                marginTop: '12px',
                                padding: '8px 12px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '4px',
                                fontSize: '13px',
                                color: '#1976d2'
                            }}>
                                編集中: {currentInitialName}
                            </div>
                        )}

                        <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#fff3cd',
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: '#856404'
                        }}>
                            <strong>操作方法:</strong><br />
                            • 左クリック: 駒を配置/削除<br />
                            • 右クリック: 成り/不成を切り替え
                        </div>
                    </div>

                    {/* Piece Palette */}
                    <div>
                        <PiecePalette
                            selectedPiece={selectedPiece}
                            onSelectPiece={(type, owner) => setSelectedPiece({ type, owner })}
                            board={board}
                            limitEnabled={limitEnabled}
                        />

                        {/* Limit toggle checkbox */}
                        <div style={{
                            marginTop: '16px',
                            padding: '12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={!limitEnabled}
                                    onChange={(e) => setLimitEnabled(!e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                駒数制限解除
                            </label>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                チェックOFF: 中将棋のルールに準拠<br />
                                チェックON: 無制限に配置可能
                            </div>
                        </div>
                    </div>
                </div>

                <SaveInitialDialog
                    isOpen={isSaveDialogOpen}
                    onClose={() => setIsSaveDialogOpen(false)}
                    onSave={handleSave}
                    currentName={currentInitialName}
                    isEditing={!!currentInitialId}
                />
            </div>
        </div>
    );
};

export default InitialSetupPage;
