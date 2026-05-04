import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

function Blog() {
    const { t } = useContext(AppContext);
    const [articles, setArticles] = useState([
        { id: 1, title: 'Қай бағдарламалау тілінен бастаған дұрыс?', text: 'Егер сіз IT саласына жаңадан қадам бассаңыз, қай тілді таңдауда қиналуыңыз мүмкін. Келіңіз қарастырайық...' },
        { id: 2, title: 'UX пен UI айырмашылығы', text: 'Дизайн әлемінде жиі шатасатын екі ұғым бар. Олар бір-бірін толықтырса да, атқаратын қызметтері бөлек...' },
        { id: 3, title: 'Резюмені қалай дұрыс жасау керек?', text: 'Алғашқы жұмысыңызды табу үшін тек білім аздық етеді. Дұрыс резюме - сіздің визиткаңыз...' }
    ]);
    const [newTitle, setNewTitle] = useState('');
    const [newText, setNewText] = useState('');

    useEffect(() => {
        document.title = t('menu-blog') + ' - Qadam';
    }, [t]);

    const handleAddArticle = (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newText.trim()) {
            alert("Тақырып пен мәтінді толтыру міндетті!");
            return;
        }
        const newArt = { id: Date.now(), title: `${newTitle} (Жаңа)`, text: newText };
        setArticles([newArt, ...articles]);
        setNewTitle('');
        setNewText('');
    };

    const handleDelete = (id) => {
        setArticles(articles.filter(a => a.id !== id));
    };

    return (
        <div style={{ padding: '20px 5%', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{t('blog-title')}</h2>

            <form onSubmit={handleAddArticle} style={{ maxWidth: '600px', margin: '0 auto 40px', padding: '20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginBottom: '15px' }}>{t('blog-add-btn')}</h3>
                <input 
                    type="text" 
                    placeholder={t('blog-ph-title')} 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }} 
                />
                <textarea 
                    placeholder={t('blog-ph-text')} 
                    rows="3" 
                    value={newText} 
                    onChange={e => setNewText(e.target.value)} 
                    style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
                ></textarea>
                <button type="submit" className="btn" style={{ width: '100%' }}>{t('blog-add-btn')}</button>
            </form>

            <div className="blog">
                {articles.map(art => (
                    <div key={art.id} className="card new-item-animation">
                        <h3>{art.title}</h3>
                        <p>{art.text}</p>
                        <button className="btn">{t('blog-read')}</button>
                        {art.title.includes('(Жаңа)') && (
                            <button className="btn" style={{ backgroundColor: 'red', marginTop: '10px' }} onClick={() => handleDelete(art.id)}>
                                Мақаланы жою
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Blog;
