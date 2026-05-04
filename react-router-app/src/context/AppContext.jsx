import React, { createContext, useState, useEffect } from 'react';
import { translations } from './translations';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'kk');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [sidebarPos, setSidebarPos] = useState(localStorage.getItem('sidebarPos') || 'left');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    useEffect(() => {
        if (sidebarPos === 'right') {
            document.body.classList.add('sidebar-right-layout');
        } else {
            document.body.classList.remove('sidebar-right-layout');
        }
        localStorage.setItem('sidebarPos', sidebarPos);
    }, [sidebarPos]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const t = (key) => translations[key] ? translations[key][lang] : key;

    return (
        <AppContext.Provider value={{
            lang, setLang,
            theme, toggleTheme,
            sidebarPos, setSidebarPos,
            sidebarOpen, setSidebarOpen,
            t
        }}>
            {children}
        </AppContext.Provider>
    );
};
