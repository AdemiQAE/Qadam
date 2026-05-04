import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

function About() {
    const { t } = useContext(AppContext);
    const [showExtra, setShowExtra] = useState(false);

    useEffect(() => {
        document.title = t('menu-about') + ' - Qadam';
    }, [t]);

    return (
        <div style={{ padding: '40px 5%', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '20px' }}>{t('about-title')}</h1>
            
            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{t('about-p1')}</p>
            <p style={{ marginBottom: '20px' }}>{t('about-p2')}</p>
            <p style={{ marginBottom: '20px', fontWeight: 'bold' }}>{t('about-p3')}</p>
            
            {showExtra && (
                <p className="highlight-text" style={{ marginBottom: '20px', display: 'block' }}>
                    {t('about-extra')}
                </p>
            )}

            <button 
                className="btn" 
                onClick={() => setShowExtra(!showExtra)}
                style={{ backgroundColor: showExtra ? '#d9534f' : 'orange' }}
            >
                {showExtra ? t('about-hide') : t('about-read-more')}
            </button>
        </div>
    );
}

export default About;
