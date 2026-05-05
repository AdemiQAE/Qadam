import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function BlogDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useContext(AppContext);
    const article = location.state?.article;

    useEffect(() => {
        if (article) {
            document.title = `${article.title} - Qadam`;
        }
    }, [article]);

    if (!article) {
        return (
            <div style={{ padding: '50px', textAlign: 'center', minHeight: '60vh' }}>
                <h2>Мақала табылмады</h2>
                <button onClick={() => navigate('/blog')} className="btn" style={{ marginTop: '20px' }}>Блогқа қайту</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 5%', maxWidth: '900px', margin: '0 auto', minHeight: '80vh' }}>
            <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '20px' }}>
                &larr; Артқа қайту
            </button>
            
            {article.image && (
                <img 
                    src={article.image} 
                    alt={article.title} 
                    style={{ 
                        width: '100%', 
                        maxHeight: '400px', 
                        objectFit: 'cover', 
                        borderRadius: '16px', 
                        marginBottom: '30px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }} 
                />
            )}
            
            <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', color: 'var(--text-main)' }}>
                {article.title}
            </h1>
            
            <div style={{ 
                lineHeight: '1.8', 
                fontSize: '1.15rem', 
                whiteSpace: 'pre-wrap',
                color: 'var(--text-main)'
            }}>
                {article.text}
            </div>
        </div>
    );
}

export default BlogDetail;
