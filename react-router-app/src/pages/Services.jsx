import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Services() {
    const { t } = useContext(AppContext);
    const { user, token } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters State
    const [searchQuery, setSearchQuery] = useState("");
    const [authorFilter, setAuthorFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Add Course Form
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', price: '', videoUrl: '', year: new Date().getFullYear().toString(), phone: '+7 700 000 0000' });

    useEffect(() => {
        document.title = t('menu-services') + ' - Qadam';
        fetchCourses();
    }, [t]);

    const fetchCourses = () => {
        setLoading(true);
        fetch('https://qadam-backend-x1d2.onrender.com/api/courses')
            .then(res => res.json())
            .then(data => {
                setCourses(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Деректерді алуда қате шықты:", err);
                setLoading(false);
            });
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const res = await fetch('https://qadam-backend-x1d2.onrender.com/api/courses', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ title: '', description: '', price: '', videoUrl: '', year: new Date().getFullYear().toString(), phone: '+7 700 000 0000' });
                setShowAddForm(false);
                fetchCourses(); 
            } else {
                alert('Қате кетті');
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Apply filters
    const filteredCourses = courses.filter(c => {
        const matchTitle = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchAuthor = c.author.toLowerCase().includes(authorFilter.toLowerCase());
        
        let matchDateFrom = true;
        let matchDateTo = true;
        if (dateFrom && c.updates) {
            matchDateFrom = new Date(c.updates) >= new Date(dateFrom);
        }
        if (dateTo && c.updates) {
            matchDateTo = new Date(c.updates) <= new Date(dateTo);
        }

        return matchTitle && matchAuthor && matchDateFrom && matchDateTo;
    });

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '30px' }}>
                <h2>Курстар Каталогы</h2>
                {user && (
                    <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? 'Жабу' : '+ Курс Қосу'}
                    </button>
                )}
            </div>

            {showAddForm && user && (
                <form onSubmit={handleAddCourse} style={{ marginBottom: '30px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
                    <h3>Жаңа курс қосу</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <input required type="text" placeholder="Атауы" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '10px' }} />
                        <input required type="number" placeholder="Бағасы (₸)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '10px' }} />
                        <input required type="url" placeholder="Презентациялық Видео URL (Iframe)" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} style={{ padding: '10px' }} />
                        <input required type="text" placeholder="Телефон" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '10px' }} />
                    </div>
                    <textarea required placeholder="Сипаттамасы" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '15px' }} />
                    <button type="submit" className="btn" style={{ marginTop: '15px' }}>Қосу</button>
                </form>
            )}

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Left Sidebar - Filters */}
                <div style={{ flex: '1 1 250px', minWidth: '250px', maxWidth: '300px', background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', alignSelf: 'flex-start' }}>
                    <h3 style={{ marginBottom: '20px' }}>Сүзгілер (Фильтр)</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label>Іздеу:</label>
                        <input type="text" placeholder="Курс атауы..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Авторы:</label>
                        <input type="text" placeholder="Автордың аты..." value={authorFilter} onChange={e => setAuthorFilter(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Жасалған күні (бастап):</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Жасалған күні (дейін):</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                    </div>

                    <button className="btn" onClick={() => {setSearchQuery(''); setAuthorFilter(''); setDateFrom(''); setDateTo('');}} style={{ width: '100%', backgroundColor: '#6c757d' }}>Тазарту</button>
                </div>

                {/* Right Grid - Catalog */}
                <div style={{ flex: '3 1 600px' }}>
                    {loading ? <p>Жүктелуде...</p> : filteredCourses.length === 0 ? <p>Ешқандай курс табылмады.</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {filteredCourses.map(course => (
                                <div key={course.id} style={{ background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                                    {/* Video iframe preview if available */}
                                    <div style={{ height: '180px', background: '#ccc', position: 'relative' }}>
                                        {course.videoUrl ? (
                                            <iframe src={course.videoUrl} frameBorder="0" allowFullScreen style={{ width: '100%', height: '100%' }}></iframe>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>Видео жоқ</div>
                                        )}
                                    </div>
                                    
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{course.title}</h3>
                                        <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem' }}>{course.price} ₸</p>
                                        <p style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '10px' }}>Авторы: {course.author}</p>
                                        <p style={{ fontSize: '0.95rem', marginBottom: '20px', flexGrow: 1 }}>{course.description.substring(0, 80)}...</p>
                                        
                                        <Link to={`/course/${course.id}`} className="btn" style={{ textAlign: 'center', textDecoration: 'none' }}>Курсқа өту</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Services;
