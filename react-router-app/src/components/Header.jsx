import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';

function Header() {
    const { lang, setLang, theme, toggleTheme, setSidebarOpen } = useContext(AppContext);
    const { user, token, logout } = useContext(AuthContext);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = () => {
        if (!user || !token) return;
        fetch('https://qadam-backend.onrender.com/api/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                if (user.role === 'admin') {
                    setUnreadCount(data.filter(m => m.status === 'pending').length);
                } else {
                    setUnreadCount(data.filter(m => m.status === 'replied' && m.user_read === 0).length);
                }
            }
        })
        .catch(console.error);
    };

    useEffect(() => {
        fetchUnread();
        window.addEventListener('messagesRead', fetchUnread);
        return () => window.removeEventListener('messagesRead', fetchUnread);
    }, [user, token]);

    return (
        <header className="dashboard-header">
            <div className="header-left">
                <button className="icon-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                <div className="logo-text"><Link to="/">Qadam</Link></div>
            </div>
            <div className="header-right">
                <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
                    <option value="kk">ҚАЗ</option>
                    <option value="ru">РУС</option>
                    <option value="en">ENG</option>
                </select>
                <label className="theme-switch">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <div className="slider round">
                        <span className="icon sun">☀️</span>
                        <span className="icon moon">🌙</span>
                    </div>
                </label>
                {user ? (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Notifications Bell */}
                        <Link to={user.role === 'admin' ? "/admin" : "/contact"} style={{ position: 'relative', textDecoration: 'none', fontSize: '1.2rem' }}>
                            🔔
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>

                        <Link to="/profile" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold' }}>{user.name}</Link>
                        <button onClick={logout} className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Шығу</button>
                    </div>
                ) : (
                    <Link to="/login" className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Кіру</Link>
                )}
            </div>
        </header>
    );
}

export default Header;
