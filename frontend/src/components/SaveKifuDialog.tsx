import React, { useState } from 'react';
import type { BoardState, Move } from '../types';
import { exportToCSA, downloadCSAFile } from '../utils/csaExporter';
import { api } from '../api/client';

interface SaveKifuDialogProps {
    moves: Move[];
    kifuId?: number;
    initialKifuName?: string;
    initialIsPublic?: boolean;
    initialSenteName?: string;
    initialGoteName?: string;
    initialBoard?: BoardState;
    onClose: (savedSenteName?: string, savedGoteName?: string) => void;
}

/**
 * Render a dialog for saving kifu text together with metadata and starting board.
 */
const SaveKifuDialog: React.FC<SaveKifuDialogProps> = ({
    moves,
    kifuId,
    initialKifuName = '',
    initialIsPublic = true,
    initialSenteName = '先手',
    initialGoteName = '後手',
    initialBoard,
    onClose
}) => {
    const [kifuName, setKifuName] = useState(initialKifuName);
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [senteName, setSenteName] = useState(initialSenteName);
    const [goteName, setGoteName] = useState(initialGoteName);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Download the current moves as a CSA file without saving to the server.
     */
    const handleDownloadCSA = () => {
        const csaText = exportToCSA(moves);
        const filename = kifuName.trim() || '棋譜';
        downloadCSAFile(csaText, filename);
        onClose();
    };

    /**
     * Save the current kifu to the server with the starting board blob.
     */
    const handleSave = async (asNew: boolean = false) => {
        if (!kifuName.trim()) {
            setError('棋譜名を入力してください');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const csaText = exportToCSA(moves);
            const targetId = asNew ? undefined : kifuId;
            const finalSente = senteName.trim() || '先手';
            const finalGote = goteName.trim() || '後手';
            const result = await api.saveKifu(kifuName.trim(), csaText, isPublic, targetId, finalSente, finalGote, initialBoard);

            if (result.success) {
                alert(targetId ? '棋譜を上書き保存しました。' : '棋譜を新規保存しました。');
                onClose(finalSente, finalGote);
            } else {
                setError(result.error || result.message || '保存に失敗しました');
            }
        } catch {
            setError('サーバーとの通信に失敗しました。ログインしていることを確認してください。');
        } finally {
            setSaving(false);
        }
    };

    /**
     * Close the dialog when the user clicks outside the panel.
     */
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
        >
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', minWidth: '400px', maxWidth: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                    {kifuId ? '棋譜を保存' : '棋譜を保存'}
                </h2>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                        棋譜名
                    </label>
                    <input
                        type="text"
                        value={kifuName}
                        onChange={e => setKifuName(e.target.value)}
                        placeholder="棋譜のタイトルを入力"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                        autoFocus
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            先手名
                        </label>
                        <input
                            type="text"
                            value={senteName}
                            onChange={e => setSenteName(e.target.value)}
                            placeholder="先手"
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                            後手名
                        </label>
                        <input
                            type="text"
                            value={goteName}
                            onChange={e => setGoteName(e.target.value)}
                            placeholder="後手"
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                        公開設定
                    </label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                            <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} style={{ marginRight: '6px' }} />
                            非公開
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                            <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} style={{ marginRight: '6px' }} />
                            公開
                        </label>
                    </div>
                </div>

                {error && (
                    <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', fontSize: '14px', color: '#c00' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button onClick={() => onClose()} style={{ padding: '8px 16px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}>
                        キャンセル
                    </button>
                    <button onClick={handleDownloadCSA} disabled={moves.length === 0} style={{ padding: '8px 16px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: moves.length === 0 ? '#eee' : '#fff', cursor: moves.length === 0 ? 'not-allowed' : 'pointer' }}>
                        CSA出力
                    </button>
                    {kifuId && (
                        <button onClick={() => handleSave(true)} disabled={moves.length === 0 || saving} style={{ padding: '8px 20px', fontSize: '14px', border: 'none', borderRadius: '4px', backgroundColor: moves.length === 0 || saving ? '#ccc' : '#28a745', color: '#fff', cursor: moves.length === 0 || saving ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                            別名で保存
                        </button>
                    )}
                    <button onClick={() => handleSave(false)} disabled={moves.length === 0 || saving} style={{ padding: '8px 24px', fontSize: '14px', border: 'none', borderRadius: '4px', backgroundColor: moves.length === 0 || saving ? '#ccc' : (kifuId ? '#007bff' : '#28a745'), color: '#fff', cursor: moves.length === 0 || saving ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                        {saving ? '保存中...' : (kifuId ? '上書き保存' : 'サーバーに保存')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveKifuDialog;
