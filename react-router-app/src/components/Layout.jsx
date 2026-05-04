import React, { useContext } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { AppContext } from '../context/AppContext';

function Layout({ children }) {
    const { t } = useContext(AppContext);
    
    return (
        <>
            <Header />
            <Sidebar />
            <main>
                {children}
            </main>
            <footer>
                <p>{t('footer-text')}</p>
            </footer>
        </>
    );
}

export default Layout;
