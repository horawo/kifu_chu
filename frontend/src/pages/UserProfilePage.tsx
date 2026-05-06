import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Render a profile editor for changing display username and password.
 */
const UserProfilePage: React.FC = () => {
    const { user, updateProfile, loading: authLoading } = useAuth();
    const [username, setUsername] = useState(user?.username ?? '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
        }
    }, [user]);

    if (authLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/signin" />;
    }

    /**
     * Validate editable fields and submit profile updates to AuthContext.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (username.trim().length === 0 || username.length > 50) {
            setError('ユーザー名は1から50文字で入力してください');
            return;
        }

        if (newPassword !== '' && newPassword.length < 8) {
            setError('新しいパスワードは8文字以上にしてください');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('新しいパスワードが一致しません');
            return;
        }

        if (newPassword !== '' && currentPassword === '') {
            setError('パスワードを変更するには現在のパスワードを入力してください');
            return;
        }

        setLoading(true);

        try {
            await updateProfile(username, currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setMessage('ユーザー情報を更新しました');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'ユーザー情報の更新に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: '#f5f7fb', padding: '32px 20px' }}>
            <div style={{ maxWidth: '560px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '28px' }}>
                <h1 style={{ margin: '0 0 24px', fontSize: '24px', color: '#222' }}>ユーザー情報編集</h1>

                {message && (
                    <div style={{ backgroundColor: '#eef9f0', border: '1px solid #bde5c8', borderRadius: '6px', padding: '12px', marginBottom: '18px', color: '#176b2c', fontSize: '14px' }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '6px', padding: '12px', marginBottom: '18px', color: '#c00', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                            ユーザーID
                        </label>
                        <input
                            type="text"
                            value={user.userId}
                            disabled
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '1px solid #d5dbe5', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#f1f3f6', color: '#666' }}
                        />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                            ユーザー名
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '1px solid #d5dbe5', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                            現在のパスワード
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="パスワード変更時のみ入力"
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '1px solid #d5dbe5', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                            新しいパスワード
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="変更しない場合は空欄"
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '1px solid #d5dbe5', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                            新しいパスワード確認
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="変更しない場合は空欄"
                            style={{ width: '100%', padding: '12px', fontSize: '15px', border: '1px solid #d5dbe5', borderRadius: '6px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '12px 20px', fontSize: '15px', fontWeight: 600, color: '#fff', backgroundColor: loading ? '#9aa4b2' : '#2f6feb', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? '更新中...' : '更新'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfilePage;
