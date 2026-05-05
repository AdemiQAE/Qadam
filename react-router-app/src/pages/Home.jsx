import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function Home() {
    const { t } = useContext(AppContext);

    useEffect(() => {
        document.title = t('menu-home') + ' - Qadam';
    }, [t]);

    return (
        <>
            <section className="hero">
                <h2>{t('home-hero-title')}</h2>
                <p>{t('home-hero-desc')}</p>
                <Link to="/services" className="btn">{t('home-btn')}</Link>
            </section>
        </>
    );
}

export default Home;
