import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface KifuItem {
    kifu_id: number;
    kifu_name: string;
    user_id: string | number;
    username?: string;
    created: string;
    is_public?: boolean;
    sente_name?: string;
    gote_name?: string;
}

const KifuListPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [kifuList, setKifuList] = useState<KifuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadKifuList();
    }, []);

    const loadKifuList = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.listKifu();
            if (result.success && Array.isArray(result.data)) {
                setKifuList(result.data);
            } else {
                setError('棋譜の取得に失敗しました');
            }
        } catch (err) {
            setError('サーバーとの通信に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleLoad = async (kifuId: number, kifuName: string, editMode: boolean) => {
        try {
            const result = await api.getKifu(kifuId);
            if (result.success && result.data) {
                navigate(`/record/${kifuId}`, {
                    state: { 
                        csaText: result.data.kifu_text,
                        kifuId: kifuId,
                        kifuName: kifuName,
                        isPublic: result.data.is_public,
                        initialBoard: result.data.initial_board,
                        editMode: editMode,
                        senteName: result.data.sente_name,
                        goteName: result.data.gote_name
                    }
                });
            } else {
                alert('棋譜の読み込みに失敗しました');
            }
        } catch (err) {
            alert('棋譜の読み込みに失敗しました');
        }
    };

    const handleDelete = async (kifuId: number, kifuName: string) => {
        if (!window.confirm(`「${kifuName}」を削除しますか？`)) {
            return;
        }
        try {
            const result = await api.deleteKifu(kifuId);
            if (result.success) {
                alert('棋譜を削除しました');
                loadKifuList();
            } else {
                alert('削除に失敗しました');
            }
        } catch (err) {
            alert('削除に失敗しました');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '80px 20px 20px 20px',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    marginBottom: '30px',
                    fontSize: '28px',
                    color: '#333',
                    borderBottom: '2px solid #667eea',
                    paddingBottom: '10px'
                }}>
                    棋譜一覧
                </h1>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        読み込み中...
                    </div>
                )}

                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '20px',
                        color: '#c00'
                    }}>
                        {error}
                    </div>
                )}

                {!loading && !error && kifuList.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666'
                    }}>
                        保存された棋譜がありません
                    </div>
                )}

                {!loading && !error && kifuList.length > 0 && (
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: '#f8f9fa',
                                borderBottom: '2px solid #dee2e6'
                            }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                                    棋譜名
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', width: '120px' }}>
                                    作成者
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', width: '120px' }}>
                                    先手
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', width: '120px' }}>
                                    後手
                                </th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057', width: '180px' }}>
                                    作成日時
                                </th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057', width: '220px' }}>
                                    アクション
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {kifuList.map((kifu) => {
                                // ログイン中のユーザーIDと、棋譜のユーザーIDが一致するか判定
                                const isOwner = currentUser && String(kifu.user_id) === String(currentUser.userId);
                                
                                return (
                                    <tr
                                        key={kifu.kifu_id}
                                        style={{ borderBottom: '1px solid #dee2e6', transition: 'background-color 0.2s' }}
                                    >
                                        <td style={{ padding: '12px', color: '#212529' }}>
                                            <div style={{ marginBottom: '8px', fontWeight: '500', fontSize: '15px' }}>
                                                {kifu.kifu_name}
                                            </div>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                backgroundColor: kifu.is_public ? '#d4edda' : '#f8d7da',
                                                color: kifu.is_public ? '#155724' : '#721c24',
                                                display: 'inline-block'
                                            }}>
                                                {kifu.is_public ? '公開' : '非公開'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', color: '#495057' }}>
                                            {kifu.username || kifu.user_id}
                                        </td>
                                        <td style={{ padding: '12px', color: '#495057' }}>
                                            {kifu.sente_name || '先手'}
                                        </td>
                                        <td style={{ padding: '12px', color: '#495057' }}>
                                            {kifu.gote_name || '後手'}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: '#6c757d', fontSize: '13px' }}>
                                            {formatDate(kifu.created)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {/* td に flex を直接かけず、div で囲むことで安全にレイアウト */}
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleLoad(kifu.kifu_id, kifu.kifu_name, false)}
                                                    style={{
                                                        padding: '6px 14px',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        color: '#fff',
                                                        backgroundColor: '#6c757d',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    再生
                                                </button>
                                                
                                                {isOwner && (
                                                    <>
                                                        <button
                                                            onClick={() => handleLoad(kifu.kifu_id, kifu.kifu_name, true)}
                                                            style={{
                                                                padding: '6px 14px',
                                                                fontSize: '13px',
                                                                fontWeight: '500',
                                                                color: '#fff',
                                                                backgroundColor: '#667eea',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            編集
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => handleDelete(kifu.kifu_id, kifu.kifu_name)}
                                                            style={{
                                                                padding: '6px 14px',
                                                                fontSize: '13px',
                                                                fontWeight: '500',
                                                                color: '#fff',
                                                                backgroundColor: '#dc3545',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            削除
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default KifuListPage;
