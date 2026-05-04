import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function Sidebar() {
    const { sidebarOpen, setSidebarOpen, sidebarPos, setSidebarPos, t } = useContext(AppContext);
    const location = useLocation();

    return (
        <nav id="sidebar" className={`sidebar ${sidebarPos === 'right' ? 'right' : ''} ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-text"><Link to="/" onClick={() => setSidebarOpen(false)}>Qadam</Link></div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                        className="icon-btn" 
                        title="Оңға/Солға" 
                        style={{ width: '30px', height: '30px', fontSize: '1rem' }}
                        onClick={() => setSidebarPos(prev => prev === 'right' ? 'left' : 'right')}
                    >⇋</button>
                    <button 
                        className="icon-btn" 
                        style={{ width: '30px', height: '30px', fontSize: '1rem' }}
                        onClick={() => setSidebarOpen(false)}
                    >×</button>
                </div>
            </div>
            <div className="sidebar-menu">
                <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setSidebarOpen(false)}>{t('menu-home')}</Link>
                <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={() => setSidebarOpen(false)}>{t('menu-about')}</Link>
                <Link to="/services" className={location.pathname === '/services' ? 'active' : ''} onClick={() => setSidebarOpen(false)}>{t('menu-services')}</Link>
                <Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''} onClick={() => setSidebarOpen(false)}>{t('menu-blog')}</Link>
                <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={() => setSidebarOpen(false)}>{t('menu-contact')}</Link>
                <hr style={{margin: '15px 0', borderColor: 'var(--border-color)'}}/>
                <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''} onClick={() => setSidebarOpen(false)}>Жеке кабинет</Link>
            </div>
        </nav>
    );
}

export default Sidebar;
