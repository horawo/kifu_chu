import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import type { BoardState, Player, Position, Move, Piece } from '../types';
import Board from '../components/Board';
import MoveList from '../components/MoveList';
import SaveKifuDialog from '../components/SaveKifuDialog';
import { createInitialBoard, getLegalMoves, canPromote, hasLionPower, isValidPos } from '../utils/chuShogiRules';
import { parseCSA } from '../utils/csaParser';
import { PIECE_DATA } from '../utils/pieceData';
import { api } from '../api/client';

const RecordPage: React.FC = () => {
    const location = useLocation();
    const { kifuId: routeKifuId } = useParams<{ kifuId: string }>();

    const [board, setBoard] = useState<BoardState>(createInitialBoard());
    const [currentPlayer, setCurrentPlayer] = useState<Player>('sente');
    const [selectedPos, setSelectedPos] = useState<Position | null>(null);
    const [validMoves, setValidMoves] = useState<Position[]>([]);

    const [promotionPending, setPromotionPending] = useState<{
        from: Position;
        to: Position;
        piece: any;
        isCapture: boolean;
    } | null>(null);

    const [multistepPending, setMultistepPending] = useState<{
        piece: any;
        from: Position;
        step1: Position;
    } | null>(null);

    const displayBoard = React.useMemo(() => {
        if (!multistepPending) return board;
        const newBoard = board.map(row => row.map(p => p ? { ...p } : null));
        const { piece, from, step1 } = multistepPending;
        newBoard[from.y][from.x] = null;
        newBoard[step1.y][step1.x] = { ...piece };
        return newBoard;
    }, [board, multistepPending]);

    const [moves, setMoves] = useState<Move[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

    const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
    const [saveMode, setSaveMode] = useState<'overwrite' | 'new'>('new');
    const [kifuId, setKifuId] = useState<number | null>(null);
    const [kifuName, setKifuName] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [editMode, setEditMode] = useState<boolean>(true);
    const [senteName, setSenteName] = useState<string>('先手');
    const [goteName, setGoteName] = useState<string>('後手');

    const openSaveDialog = (mode: 'overwrite' | 'new') => {
        setSaveMode(mode);
        setShowSaveDialog(true);
    };

    useEffect(() => {
        const state = location.state as {
            csaText?: string;
            customBoard?: BoardState;
            kifuId?: number;
            kifuName?: string;
            isPublic?: boolean;
            editMode?: boolean;
        } | null;

        if (routeKifuId === 'new') {
            setBoard(state?.customBoard || createInitialBoard());
            setMoves([]);
            setCurrentMoveIndex(-1);
            setCurrentPlayer('sente');
            setKifuId(null);
            setKifuName('');
            setIsPublic(true);
            setEditMode(true);
            setSenteName('先手');
            setGoteName('後手');
            return;
        }

        const idNum = Number(routeKifuId);
        if (isNaN(idNum)) return;

        if (state?.csaText) {
            loadCSAText(state.csaText);
            setKifuId(state.kifuId || idNum);
            if (state.kifuName) setKifuName(state.kifuName);
            if (state.isPublic !== undefined) setIsPublic(state.isPublic);
            if (state.editMode !== undefined) setEditMode(state.editMode);
            if ((state as any).senteName) setSenteName((state as any).senteName);
            if ((state as any).goteName) setGoteName((state as any).goteName);
        } else {
            api.getKifu(idNum).then(result => {
                if (result.success && result.data) {
                    loadCSAText(result.data.kifu_text);
                    setKifuId(idNum);
                    if ((result.data as any).title) setKifuName((result.data as any).title);
                    if (result.data.is_public !== undefined) setIsPublic(result.data.is_public);
                    setEditMode(false); // ID直接アクセスの場合は安全のためデフォルト再生モード
                    if (result.data.sente_name) setSenteName(result.data.sente_name);
                    if (result.data.gote_name) setGoteName(result.data.gote_name);
                }
            }).catch(err => {
                console.error('Failed to fetch kifu:', err);
            });
        }
    }, [location.state, routeKifuId]);

    const loadCSAText = (csaText: string) => {
        try {
            const result = parseCSA(csaText);
            const loadedMoves: Move[] = [];
            let currentBoard = createInitialBoard();
            let player: Player = 'sente';

            for (const parsedMove of result.moves) {
                const { from, to, pieceType } = parsedMove;
                const piece = currentBoard[from.y][from.x];
                if (!piece) continue;
                const captured = currentBoard[to.y][to.x];
                const movedPiece = { ...piece };
                const pData = PIECE_DATA[piece.type];
                const promoted = pData.promotedType === pieceType;
                if (promoted) movedPiece.isPromoted = true;
                currentBoard[to.y][to.x] = movedPiece;
                currentBoard[from.y][from.x] = null;
                loadedMoves.push({ from, to, piece, promoted, captured: captured || undefined });

                player = player === 'sente' ? 'gote' : 'sente';
            }
            setMoves(loadedMoves);
            setCurrentMoveIndex(-1);
            setBoard(createInitialBoard());
            setCurrentPlayer('sente');
        } catch (err) { }
    };

    const recordMove = (move: Move) => {
        const newMoves = moves.slice(0, currentMoveIndex + 1);
        newMoves.push(move);
        setMoves(newMoves);
        setCurrentMoveIndex(newMoves.length - 1);
    };

    const finalizeMove = (from: Position, to: Position, piece: Piece, promote: boolean, lionMidStep?: Position) => {
        const newBoard = board.map(row => row.map(p => p ? { ...p } : null));
        const captured = newBoard[to.y][to.x];
        const movedPiece = { ...piece };
        if (promote) movedPiece.isPromoted = true;

        newBoard[to.y][to.x] = movedPiece;
        newBoard[from.y][from.x] = null;

        recordMove({
            from,
            to,
            piece,
            promoted: promote,
            captured: captured || undefined,
            lionMidStep
        });

        setBoard(newBoard);
        setSelectedPos(null);
        setValidMoves([]);
        setPromotionPending(null);
        setMultistepPending(null);
        setCurrentPlayer(prev => prev === 'sente' ? 'gote' : 'sente');
    };

    const applyMove = (boardState: BoardState, move: Move): BoardState => {
        const newBoard = boardState.map(row => row.map(p => p ? { ...p } : null));
        const movedPiece = { ...move.piece };
        if (move.promoted) movedPiece.isPromoted = true;
        if (move.lionMidStep) newBoard[move.lionMidStep.y][move.lionMidStep.x] = null;
        newBoard[move.to.y][move.to.x] = movedPiece;
        newBoard[move.from.y][move.from.x] = null;
        return newBoard;
    };

    const replayMovesUpTo = (index: number): BoardState => {
        let current = createInitialBoard();
        for (let i = 0; i <= index; i++) {
            current = applyMove(current, moves[i]);
        }
        return current;
    };

    const getPlayerForIndex = (index: number, movesArray: Move[] = moves): Player => {
        if (index < 0) return 'sente';

        // 履歴の途中にいる場合、次の手を指したプレイヤーが現在の手番
        if (index < movesArray.length - 1) {
            return movesArray[index + 1].piece.owner;
        }

        // 履歴の最後にいる場合、直前の手を指したプレイヤーの相手の手番と推定する
        return movesArray[index].piece.owner === 'sente' ? 'gote' : 'sente';
    };

    const undo = () => {
        if (currentMoveIndex >= 0) {
            const newIndex = currentMoveIndex - 1;
            setCurrentMoveIndex(newIndex);
            setBoard(newIndex >= 0 ? replayMovesUpTo(newIndex) : createInitialBoard());
            setCurrentPlayer(getPlayerForIndex(newIndex));
            setSelectedPos(null);
            setValidMoves([]);
            setMultistepPending(null);
            setPromotionPending(null);
        }
    };

    const redo = () => {
        if (currentMoveIndex < moves.length - 1) {
            const newIndex = currentMoveIndex + 1;
            setCurrentMoveIndex(newIndex);
            setBoard(replayMovesUpTo(newIndex));
            setCurrentPlayer(getPlayerForIndex(newIndex));
            setSelectedPos(null);
            setValidMoves([]);
            setMultistepPending(null);
            setPromotionPending(null);
        }
    };

    const jumpToMove = (index: number) => {
        setCurrentMoveIndex(index);
        setBoard(index >= 0 ? replayMovesUpTo(index) : createInitialBoard());
        setCurrentPlayer(getPlayerForIndex(index));
        setSelectedPos(null);
        setValidMoves([]);
        setMultistepPending(null);
        setPromotionPending(null);
    };

    const handleSquareClick = (pos: Position) => {
        if (promotionPending) return;

        if (multistepPending) {
            const { piece, from, step1 } = multistepPending;
            if (pos.x === step1.x && pos.y === step1.y) {
                setMultistepPending(null);
                setSelectedPos(null);
                setValidMoves([]);
                setCurrentPlayer(prev => prev === 'sente' ? 'gote' : 'sente');
                return;
            }
            if (pos.x === from.x && pos.y === from.y) {
                const newBoard = board.map(row => row.map(p => p ? { ...p } : null));
                recordMove({ from: step1, to: from, piece, promoted: false, captured: undefined });
                newBoard[step1.y][step1.x] = null;
                newBoard[from.y][from.x] = { ...piece };
                setBoard(newBoard);
                setMultistepPending(null);
                setSelectedPos(null);
                setValidMoves([]);
                setCurrentPlayer(prev => prev === 'sente' ? 'gote' : 'sente');
                return;
            }

            let pData = PIECE_DATA[piece.type];
            if (piece.isPromoted && pData.promotedType) pData = PIECE_DATA[pData.promotedType];
            const special = pData.movement?.special;
            const dy = pos.y - step1.y;
            const dx = pos.x - step1.x;

            if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
                if ((special === 'eagle' || special === 'falcon') && (dx !== (step1.x - from.x) || dy !== (step1.y - from.y))) return;
                const newBoard = board.map(row => row.map(p => p ? { ...p } : null));
                const targetAtPos = newBoard[pos.y][pos.x];
                recordMove({ from: step1, to: pos, piece, promoted: false, captured: targetAtPos || undefined });
                newBoard[step1.y][step1.x] = null;
                newBoard[pos.y][pos.x] = { ...piece };
                setBoard(newBoard);
                setMultistepPending(null);
                setSelectedPos(null);
                setValidMoves([]);
                setCurrentPlayer(prev => prev === 'sente' ? 'gote' : 'sente');
                return;
            }
            return;
        }

        if (selectedPos) {
            if (selectedPos.x === pos.x && selectedPos.y === pos.y) {
                setSelectedPos(null);
                setValidMoves([]);
                return;
            }
            const isValidMove = validMoves.some(m => m.x === pos.x && m.y === pos.y);
            const targetPiece = board[pos.y][pos.x];

            if (!isValidMove && targetPiece && targetPiece.owner === currentPlayer) {
                setSelectedPos(pos);
                setValidMoves(getLegalMoves(board, pos, currentPlayer));
                return;
            }

            if (isValidMove) {
                const pieceToMove = board[selectedPos.y][selectedPos.x];
                if (!pieceToMove) return;

                const dx = pos.x - selectedPos.x;
                const dy = pos.y - selectedPos.y;
                if ((dx * dx + dy * dy) <= 2 && hasLionPower(pieceToMove, dx, dy)) {
                    recordMove({ from: selectedPos, to: pos, piece: pieceToMove, promoted: false, captured: targetPiece || undefined });
                    const midBoard = board.map(row => row.map(p => p ? { ...p } : null));
                    midBoard[selectedPos.y][selectedPos.x] = null;
                    midBoard[pos.y][pos.x] = { ...pieceToMove };
                    setBoard(midBoard);
                    setMultistepPending({ piece: pieceToMove, from: selectedPos, step1: pos });

                    let pData = PIECE_DATA[pieceToMove.type];
                    if (pieceToMove.isPromoted && pData.promotedType) pData = PIECE_DATA[pData.promotedType];
                    const special = pData.movement?.special;
                    const nextMoves: Position[] = [];
                    if (special === 'lion') {
                        for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
                            const t = { x: pos.x + x, y: pos.y + y };
                            if (isValidPos(t)) nextMoves.push(t);
                        }
                        if (!nextMoves.some(m => m.x === selectedPos.x && m.y === selectedPos.y)) nextMoves.push(selectedPos);
                    } else {
                        const t2 = { x: pos.x + dx, y: pos.y + dy };
                        if (isValidPos(t2)) nextMoves.push(t2);
                        nextMoves.push(selectedPos);
                        nextMoves.push(pos);
                    }
                    setValidMoves(nextMoves);
                    setSelectedPos(pos);
                    return;
                }

                const isCapture = targetPiece !== null && targetPiece.owner !== currentPlayer;
                if (canPromote(pieceToMove, selectedPos, pos, isCapture)) {
                    setPromotionPending({ from: selectedPos, to: pos, piece: pieceToMove, isCapture });
                    return;
                }

                finalizeMove(selectedPos, pos, pieceToMove, false);
            } else {
                setSelectedPos(null);
                setValidMoves([]);
            }
        } else {
            const piece = board[pos.y][pos.x];
            if (piece && piece.owner === currentPlayer) {
                setSelectedPos(pos);
                setValidMoves(getLegalMoves(board, pos, currentPlayer));
            }
        }
    };

    const handlePromotionConfirm = (promote: boolean) => {
        if (!promotionPending) return;
        const { from, to, piece } = promotionPending;
        finalizeMove(from, to, piece, promote);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 30px', gap: '40px', alignItems: 'flex-start' }}>
            {/* 左側：手番表示、盤面 */}
            {/* 盤面の幅にピッタリ合わせるため max-content に設定 */}
            <div style={{ width: 'max-content', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                    手番: {currentPlayer === 'sente' ? `${senteName} (▲)` : `${goteName} (▽)`}
                    {kifuId && (
                        <span style={{ marginLeft: '15px', fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
                            {editMode ? '【編集モード】' : '【再生モード】'}
                        </span>
                    )}
                </div>
                
                <Board
                    board={displayBoard}
                    onSquareClick={handleSquareClick}
                    selectedPos={multistepPending ? multistepPending.step1 : selectedPos}
                    validMoves={validMoves}
                    currentPlayer={currentPlayer}
                    promotionCandidate={promotionPending ? {
                        pos: promotionPending.to,
                        piece: promotionPending.piece,
                        onConfirm: handlePromotionConfirm
                    } : null}
                />
            </div>

            {/* 右側：再生コントロール、指し手一覧、保存ボタン */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '15px', height: '613px' }}>
                {/* 1段目：操作ボタン群と手数表示 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%' }}>
                        <button title="最初" onClick={() => jumpToMove(-1)} disabled={currentMoveIndex < 0} style={{ padding: '6px 12px', fontSize: '16px', cursor: currentMoveIndex < 0 ? 'not-allowed' : 'pointer' }}>⏮</button>
                        <button title="10手戻る" onClick={() => jumpToMove(Math.max(-1, currentMoveIndex - 10))} disabled={currentMoveIndex < 0} style={{ padding: '6px 12px', fontSize: '16px', cursor: currentMoveIndex < 0 ? 'not-allowed' : 'pointer' }}>⏪</button>
                        <button title="1手戻る" onClick={undo} disabled={currentMoveIndex < 0} style={{ padding: '6px 16px', fontSize: '16px', fontWeight: 'bold', cursor: currentMoveIndex < 0 ? 'not-allowed' : 'pointer' }}>◀</button>
                        <button title="1手進む" onClick={redo} disabled={currentMoveIndex >= moves.length - 1} style={{ padding: '6px 16px', fontSize: '16px', fontWeight: 'bold', cursor: currentMoveIndex >= moves.length - 1 ? 'not-allowed' : 'pointer' }}>▶</button>
                        <button title="10手進む" onClick={() => jumpToMove(Math.min(moves.length - 1, currentMoveIndex + 10))} disabled={currentMoveIndex >= moves.length - 1} style={{ padding: '6px 12px', fontSize: '16px', cursor: currentMoveIndex >= moves.length - 1 ? 'not-allowed' : 'pointer' }}>⏩</button>
                        <button title="最後" onClick={() => jumpToMove(moves.length - 1)} disabled={currentMoveIndex >= moves.length - 1} style={{ padding: '6px 12px', fontSize: '16px', cursor: currentMoveIndex >= moves.length - 1 ? 'not-allowed' : 'pointer' }}>⏭</button>
                    </div>
                    <div style={{ fontSize: '14px', color: '#555', fontWeight: 'bold', letterSpacing: '1px', textAlign: 'center' }}>
                        手数: {currentMoveIndex + 1} / {moves.length}
                    </div>
                </div>

                {/* 2段目：指し手一覧（残りの高さをすべて埋める） */}
                <div style={{ flex: 1, minHeight: 0 }}>
                    <MoveList moves={moves} currentMoveIndex={currentMoveIndex} onMoveClick={jumpToMove} />
                </div>

                {/* 3段目：保存ボタン */}
                {editMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
                        {kifuId ? (
                            <>
                                <button onClick={() => openSaveDialog('overwrite')} disabled={moves.length === 0} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: moves.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background-color 0.2s' }}>📝 上書き保存</button>
                                <button onClick={() => openSaveDialog('new')} disabled={moves.length === 0} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: moves.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background-color 0.2s' }}>📄 別名で保存</button>
                            </>
                        ) : (
                            <button onClick={() => openSaveDialog('new')} disabled={moves.length === 0} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: moves.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background-color 0.2s' }}>💾 棋譜を保存</button>
                        )}
                    </div>
                )}
            </div>

            {showSaveDialog && (
                <SaveKifuDialog
                    moves={moves}
                    kifuId={saveMode === 'overwrite' && kifuId ? kifuId : undefined}
                    initialKifuName={kifuName}
                    initialIsPublic={isPublic}
                    initialSenteName={senteName}
                    initialGoteName={goteName}
                    onClose={(savedSenteName?: string, savedGoteName?: string) => {
                        setShowSaveDialog(false);
                        if (savedSenteName) setSenteName(savedSenteName);
                        if (savedGoteName) setGoteName(savedGoteName);
                    }}
                />
            )}
        </div>
    );
};

export default RecordPage;
