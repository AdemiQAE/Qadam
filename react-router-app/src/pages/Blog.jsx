import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

function Blog() {
    const { t } = useContext(AppContext);
    const navigate = useNavigate();
    const [articles, setArticles] = useState([
        { id: 1, title: 'Қай бағдарламалау тілінен бастаған дұрыс?', text: 'Егер сіз IT саласына жаңадан қадам бассаңыз, қай тілді таңдауда қиналуыңыз мүмкін. Келіңіз қарастырайық...', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80' },
        { id: 2, title: 'UX пен UI айырмашылығы', text: 'Дизайн әлемінде жиі шатасатын екі ұғым бар. Олар бір-бірін толықтырса да, атқаратын қызметтері бөлек...', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80' },
        { id: 3, title: 'Резюмені қалай дұрыс жасау керек?', text: 'Алғашқы жұмысыңызды табу үшін тек білім аздық етеді. Дұрыс резюме - сіздің визиткаңыз...', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80' }
    ]);
    const [newTitle, setNewTitle] = useState('');
    const [newText, setNewText] = useState('');
    const [newImage, setNewImage] = useState('');

    useEffect(() => {
        document.title = t('menu-blog') + ' - Qadam';
    }, [t]);

    const handleAddArticle = (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newText.trim()) {
            alert("Тақырып пен мәтінді толтыру міндетті!");
            return;
        }
        const newArt = { id: Date.now(), title: `${newTitle} (Жаңа)`, text: newText, image: newImage };
        setArticles([newArt, ...articles]);
        setNewTitle('');
        setNewText('');
        setNewImage('');
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
                <input 
                    type="text" 
                    placeholder="Суретке сілтеме (URL) - міндетті емес" 
                    value={newImage} 
                    onChange={e => setNewImage(e.target.value)} 
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
                    <div key={art.id} className="card new-item-animation" style={{ display: 'flex', flexDirection: 'column' }}>
                        {art.image && <img src={art.image} alt={art.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '15px' }} />}
                        <h3 style={{ marginBottom: '10px' }}>{art.title}</h3>
                        <p style={{ flexGrow: 1, marginBottom: '20px' }}>{art.text.length > 100 ? art.text.substring(0, 100) + '...' : art.text}</p>
                        <button className="btn" onClick={() => navigate(`/blog/${art.id}`, { state: { article: art } })}>{t('blog-read')}</button>
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
