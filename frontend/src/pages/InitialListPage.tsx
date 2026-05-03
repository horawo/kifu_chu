import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface InitialSetup {
    initial_id: number;
    initial_name: string;
    created: string;
    updated: string;
}

const InitialListPage: React.FC = () => {
    const [initials, setInitials] = useState<InitialSetup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const loadInitials = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/initial.php?action=list', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setInitials(data.data || []);
            } else {
                alert('一覧の取得に失敗しました');
            }
        } catch (error) {
            console.error('Failed to load initials:', error);
            alert('一覧の取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInitials();
    }, []);

    const handleLoad = (initialId: number) => {
        navigate('/setup', { state: { loadInitialId: initialId } });
    };

    const handleDelete = async (initialId: number, initialName: string) => {
        if (!confirm(`「${initialName}」を削除しますか？`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/initial.php?action=delete&initial_id=${initialId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                loadInitials();
            } else {
                alert('削除に失敗しました: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to delete initial:', error);
            alert('削除に失敗しました');
        }
    };

    const handleNewSetup = () => {
        navigate('/setup');
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '80px 20px 20px 20px',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '28px',
                        color: '#333'
                    }}>
                        初期配置一覧
                    </h1>
                    <button
                        onClick={handleNewSetup}
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
                        新規作成
                    </button>
                </div>

                {isLoading ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        borderRadius: '8px'
                    }}>
                        読み込み中...
                    </div>
                ) : initials.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        color: '#666'
                    }}>
                        保存された初期配置はありません
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        borderBottom: '1px solid #dee2e6',
                                        fontWeight: '600'
                                    }}>
                                        配置名
                                    </th>
                                    <th style={{
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        borderBottom: '1px solid #dee2e6',
                                        fontWeight: '600',
                                        width: '180px'
                                    }}>
                                        更新日時
                                    </th>
                                    <th style={{
                                        padding: '12px 16px',
                                        textAlign: 'right',
                                        borderBottom: '1px solid #dee2e6',
                                        fontWeight: '600',
                                        width: '200px'
                                    }}>
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {initials.map((initial) => (
                                    <tr
                                        key={initial.initial_id}
                                        style={{ borderBottom: '1px solid #dee2e6' }}
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            {initial.initial_name}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            color: '#666',
                                            fontSize: '14px'
                                        }}>
                                            {new Date(initial.updated).toLocaleString('ja-JP')}
                                        </td>
                                        <td style={{
                                            padding: '12px 16px',
                                            textAlign: 'right'
                                        }}>
                                            <button
                                                onClick={() => handleLoad(initial.initial_id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#28a745',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginRight: '8px'
                                                }}
                                            >
                                                編集
                                            </button>
                                            <button
                                                onClick={() => handleDelete(initial.initial_id, initial.initial_name)}
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#dc3545',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InitialListPage;
