import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function AdminPanel() {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // users, courses, messages

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const uRes = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(uRes.ok) setUsers(await uRes.json());

            const cRes = await fetch('http://localhost:5000/api/courses');
            if(cRes.ok) setCourses(await cRes.json());

            const mRes = await fetch('http://localhost:5000/api/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(mRes.ok) setMessages(await mRes.json());
        } catch (e) { console.error(e); }
    };

    const toggleBlockUser = async (id, currentStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/users/${id}/block`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isBlocked: currentStatus ? 0 : 1 })
            });
            if(res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    const toggleRole = async (id, currentRole) => {
        if(!window.confirm('Пайдаланушының рөлін өзгертесіз бе?')) return;
        try {
            const newRole = currentRole === 'admin' ? 'user' : 'admin';
            const res = await fetch(`http://localhost:5000/api/users/${id}/role`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if(res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    const handleStartChat = async (userId) => {
        const messageText = prompt("Пайдаланушыға жіберетін хабарламаңызды жазыңыз:");
        if(!messageText || !messageText.trim()) return;

        try {
            const res = await fetch(`http://localhost:5000/api/messages/admin`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_id: userId, message_text: messageText })
            });
            if(res.ok) {
                alert("Хабарлама жіберілді!");
                fetchData();
            } else {
                alert("Қате кетті");
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteUser = async (id) => {
        if(!window.confirm('Пайдаланушыны өшіресіз бе? Бұл оның барлық курстарын да өшіреді!')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    const handleDeleteCourse = async (id) => {
        if(!window.confirm('Курсты өшіресіз бе?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    const handleReply = async (id) => {
        const replyText = prompt("Жауабыңызды жазыңыз:");
        if(!replyText || !replyText.trim()) return;

        try {
            const res = await fetch(`http://localhost:5000/api/messages/${id}/reply`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reply_text: replyText })
            });
            if(res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
            <h2>Әкімшілік (Admin) Панель</h2>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn" onClick={() => setActiveTab('users')} style={{ opacity: activeTab === 'users' ? 1 : 0.7 }}>Пайдаланушылар</button>
                <button className="btn" onClick={() => setActiveTab('courses')} style={{ opacity: activeTab === 'courses' ? 1 : 0.7 }}>Курстар</button>
                <button className="btn" onClick={() => setActiveTab('messages')} style={{ opacity: activeTab === 'messages' ? 1 : 0.7, position: 'relative' }}>
                    Хабарламалар
                    {messages.filter(m => m.status === 'pending').length > 0 && (
                        <span style={{ position: 'absolute', top: '-5px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' }}>
                            {messages.filter(m => m.status === 'pending').length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'users' && (
                <div style={{ marginTop: '30px', background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
                    <h3>Пайдаланушыларды басқару</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'var(--primary-color)', color: 'white' }}>
                                <th style={{ padding: '10px' }}>ID</th>
                                <th style={{ padding: '10px' }}>Аты</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Рөлі</th>
                                <th style={{ padding: '10px' }}>Статус</th>
                                <th style={{ padding: '10px' }}>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{u.id}</td>
                                    <td style={{ padding: '10px' }}>{u.name}</td>
                                    <td style={{ padding: '10px' }}>{u.email}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button className="btn" onClick={() => toggleRole(u.id, u.role)} style={{ padding: '3px 8px', fontSize: '0.8rem', background: u.role === 'admin' ? '#007bff' : 'gray' }}>
                                            {u.role}
                                        </button>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center', color: u.isBlocked ? 'red' : 'green' }}>
                                        {u.isBlocked ? 'Блокталған' : 'Белсенді'}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button className="btn" onClick={() => handleStartChat(u.id)} style={{ marginRight: '5px', padding: '5px', fontSize: '0.8rem', background: '#17a2b8' }}>Хат жазу</button>
                                        {u.role !== 'admin' && (
                                            <>
                                                <button className="btn" onClick={() => toggleBlockUser(u.id, u.isBlocked)} style={{ marginRight: '5px', padding: '5px', fontSize: '0.8rem' }}>
                                                    {u.isBlocked ? 'Блоктан шығару' : 'Блоктау'}
                                                </button>
                                                <button className="btn" onClick={() => handleDeleteUser(u.id)} style={{ padding: '5px', fontSize: '0.8rem', background: 'red' }}>Өшіру</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'courses' && (
                <div style={{ marginTop: '30px', background: 'var(--bg-card)', padding: '20px', borderRadius: '8px' }}>
                    <h3>Курстарды басқару</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ background: 'var(--primary-color)', color: 'white' }}>
                                <th style={{ padding: '10px' }}>ID</th>
                                <th style={{ padding: '10px' }}>Атауы</th>
                                <th style={{ padding: '10px' }}>Авторы</th>
                                <th style={{ padding: '10px' }}>Бағасы</th>
                                <th style={{ padding: '10px' }}>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{c.id}</td>
                                    <td style={{ padding: '10px' }}>{c.title}</td>
                                    <td style={{ padding: '10px' }}>{c.author}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{c.price} ₸</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button className="btn" onClick={() => handleDeleteCourse(c.id)} style={{ padding: '5px', fontSize: '0.8rem', background: 'red' }}>Өшіру</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'messages' && (
                <div style={{ marginTop: '30px', background: 'var(--bg-card)', padding: '20px', borderRadius: '8px' }}>
                    <h3>Қолдау қызметі (Хаттар)</h3>
                    {messages.length === 0 ? <p>Хаттар жоқ.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                            {messages.map(m => (
                                <div key={m.id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px', borderLeft: m.status === 'pending' ? '4px solid red' : '4px solid green' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'gray', marginBottom: '10px' }}>Кімнен: <strong>{m.user_name}</strong> ({m.user_email}) | Уақыты: {new Date(m.created_at).toLocaleString()}</p>
                                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Сұрақ/Хабарлама: {m.message_text}</p>
                                    
                                    {m.status === 'replied' ? (
                                        <div style={{ background: 'var(--bg-body)', padding: '10px', borderRadius: '5px' }}>
                                            <span style={{ fontWeight: 'bold', color: 'green' }}>Жауап берілді:</span> {m.reply_text}
                                        </div>
                                    ) : (
                                        <button className="btn" onClick={() => handleReply(m.id)} style={{ background: '#28a745' }}>Жауап қайтару</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
