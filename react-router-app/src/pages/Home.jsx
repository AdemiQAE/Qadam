import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function Home() {
    const { t } = useContext(AppContext);
    const [timeLeft, setTimeLeft] = useState(10);
    const [showPromo, setShowPromo] = useState(true);

    useEffect(() => {
        document.title = t('menu-home') + ' - Qadam';
    }, [t]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setTimeout(() => setShowPromo(false), 500);
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    return (
        <>
            {showPromo && (
                <div id="promo-banner" style={{ 
                    backgroundColor: 'yellow', color: 'black', padding: '10px', 
                    textAlign: 'center', fontWeight: 'bold',
                    opacity: timeLeft <= 0 ? 0 : 1, transition: 'opacity 0.5s'
                }}>
                    <span>{t('home-promo')}</span> <span id="promo-timer">{timeLeft}</span> <span>{t('home-promo-sec')}</span>
                </div>
            )}
            <section className="hero">
                <h2>{t('home-hero-title')}</h2>
                <p>{t('home-hero-desc')}</p>
                <Link to="/services" className="btn">{t('home-btn')}</Link>
            </section>
        </>
    );
}

export default Home;
