import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Contact() {
    const { t } = useContext(AppContext);
    const { user, token } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        document.title = t('menu-contact') + ' - Qadam';
        if (user) {
            fetchMessages();
        }
    }, [t, user]);

    const fetchMessages = async () => {
        try {
            const res = await fetch('https://qadam-backend.onrender.com/api/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                
                let hasUnread = false;
                // Mark all unread replied messages as read for this user
                data.forEach(m => {
                    if (m.status === 'replied' && m.user_read === 0) {
                        hasUnread = true;
                        fetch(`https://qadam-backend.onrender.com/api/messages/${m.id}/read`, {
                            method: 'PATCH',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                    }
                });
                if (hasUnread) {
                    // Update header bell
                    window.dispatchEvent(new Event('messagesRead'));
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;

        try {
            const res = await fetch('https://qadam-backend.onrender.com/api/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message_text: newMsg })
            });
            if (res.ok) {
                setNewMsg('');
                setStatusMsg({ text: 'Хабарлама сәтті жіберілді!', type: 'success' });
                fetchMessages();
            } else {
                setStatusMsg({ text: 'Қате кетті', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Сервер қатесі', type: 'error' });
        }
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
                <h2>Байланыс</h2>
                <p>Админге хабарлама жіберу үшін жүйеге кіруіңіз керек.</p>
                <Link to="/login" className="btn" style={{ marginTop: '20px', display: 'inline-block' }}>Кіру</Link>
            </div>
        );
    }

    return (
        <section className="contact-section" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Админмен байланыс (Қолдау қызметі)</h2>
            
            <form onSubmit={handleSendMessage} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Жаңа хабарлама (Сұрақ немесе шағым):</label>
                <textarea 
                    rows="4" 
                    value={newMsg} 
                    onChange={e => setNewMsg(e.target.value)} 
                    placeholder="Хат мәтінін жазыңыз..." 
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)', marginBottom: '15px' }}
                ></textarea>
                <button type="submit" className="btn">Жіберу</button>
                {statusMsg.text && (
                    <p style={{ marginTop: '15px', color: statusMsg.type === 'error' ? 'red' : 'green', fontWeight: 'bold' }}>
                        {statusMsg.text}
                    </p>
                )}
            </form>

            <div>
                <h3>Менің хаттарым</h3>
                {messages.length === 0 ? <p>Сіз әлі хат жіберген жоқсыз.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                        {messages.map(m => (
                            <div key={m.id} style={{ background: 'var(--bg-card)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <p style={{ fontSize: '0.85rem', color: 'gray', marginBottom: '10px' }}>Жіберілді: {new Date(m.created_at).toLocaleString()}</p>
                                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Сұрақ: {m.message_text}</p>
                                
                                {m.status === 'replied' ? (
                                    <div style={{ background: 'var(--bg-body)', padding: '10px', borderRadius: '5px', borderLeft: '3px solid green' }}>
                                        <span style={{ fontWeight: 'bold', color: 'green' }}>Админ жауабы:</span>
                                        <p style={{ marginTop: '5px' }}>{m.reply_text}</p>
                                    </div>
                                ) : (
                                    <span style={{ color: 'orange', fontSize: '0.9rem' }}>Жауап күтілуде...</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Contact;
