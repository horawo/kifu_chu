import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TopBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    return (
        <div style={{
            backgroundColor: '#2c3e50',
            color: '#fff',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
            {/* Logo/Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '20px', fontWeight: '700' }}>
                    中将棋棋譜取るマン(仮)
                </Link>

                {/* Navigation Links (only when logged in) */}
                {user && (
                    <nav style={{ display: 'flex', gap: '16px' }}>
                        <Link
                            to="/record/new"
                            style={{
                                color: '#ecf0f1',
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            採譜
                        </Link>
                        <Link
                            to="/kifu"
                            style={{
                                color: '#ecf0f1',
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            棋譜一覧
                        </Link>
                        <Link
                            to="/setup"
                            style={{
                                color: '#ecf0f1',
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            初期配置
                        </Link>
                        <Link
                            to="/initial"
                            style={{
                                color: '#ecf0f1',
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            配置一覧
                        </Link>
                    </nav>
                )}
            </div>

            {/* User Info / Auth Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user ? (
                    <>
                        <span style={{ fontSize: '14px', color: '#ecf0f1' }}>
                            👤 {user.username}
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '6px 16px',
                                fontSize: '14px',
                                backgroundColor: '#e74c3c',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                        >
                            ログアウト
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/signin">
                            <button
                                style={{
                                    padding: '6px 16px',
                                    fontSize: '14px',
                                    backgroundColor: 'transparent',
                                    color: '#fff',
                                    border: '1px solid #fff',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                    e.currentTarget.style.color = '#2c3e50';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#fff';
                                }}
                            >
                                ログイン
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button
                                style={{
                                    padding: '6px 16px',
                                    fontSize: '14px',
                                    backgroundColor: '#3498db',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                            >
                                サインアップ
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default TopBar;
