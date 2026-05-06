import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Render the account registration form with separate login ID and display username fields.
 */
const SignUpPage: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    /**
     * Validate the form and register the account through AuthContext.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!/^[A-Za-z0-9_.-]{3,30}$/.test(userId)) {
            setError('ユーザーIDは3から30文字の英数字、_、.、-で入力してください');
            return;
        }

        if (username.trim().length === 0 || username.length > 50) {
            setError('ユーザー名は1から50文字で入力してください');
            return;
        }

        if (password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        if (password.length < 8) {
            setError('パスワードは8文字以上にしてください');
            return;
        }

        setLoading(true);

        try {
            await register(userId, username, password);
            navigate('/record/new');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '登録に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                padding: '40px',
                minWidth: '400px',
                maxWidth: '500px'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '28px', color: '#333' }}>
                    中将棋記録ツール
                </h1>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontSize: '14px' }}>
                    新規アカウント作成
                </p>

                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '20px',
                        color: '#c00',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            ユーザーID
                        </label>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                            autoFocus
                            placeholder="ログインに使用します"
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="画面に表示される名前"
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="8文字以上"
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            パスワード確認
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="もう一度入力"
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', color: '#fff', background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '20px' }}
                    >
                        {loading ? '登録中...' : 'サインアップ'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
                    すでにアカウントをお持ちですか？{' '}
                    <Link to="/signin" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                        ログイン
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
