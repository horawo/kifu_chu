import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Render the login form that authenticates with user ID and password.
 */
const SignInPage: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    /**
     * Submit login credentials and move authenticated users to the kifu list.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(userId, password);
            navigate('/kifu');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'ログインに失敗しました');
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
                    アカウントにログイン
                </p>

                {error && (
                    <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '6px', padding: '12px', marginBottom: '20px', color: '#c00', fontSize: '14px' }}>
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
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '2px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', color: '#fff', background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '20px' }}
                    >
                        {loading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
                    アカウントをお持ちでないですか？{' '}
                    <Link to="/signup" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                        サインアップ
                    </Link>
                </div>

                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '6px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
                    テスト用: testuser / password123
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
