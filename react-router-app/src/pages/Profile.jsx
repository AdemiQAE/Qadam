import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Profile() {
    const { user, token, logout, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('info');
    
    // Info State
    const [infoData, setInfoData] = useState({ name: '', email: '', password: '' });
    const [infoMsg, setInfoMsg] = useState('');

    // Courses State
    const [myCourses, setMyCourses] = useState([]);
    const [requests, setRequests] = useState([]);
    const [studentRequests, setStudentRequests] = useState([]);

    // Admin State
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setInfoData({ name: user.name, email: user.email, password: '' });
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            // Fetch authored courses
            const coursesRes = await fetch('http://localhost:5000/api/courses/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(coursesRes.ok) setMyCourses(await coursesRes.json());

            // Fetch requests for my courses (teacher view)
            const reqTeacherRes = await fetch('http://localhost:5000/api/requests/teacher', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(reqTeacherRes.ok) setRequests(await reqTeacherRes.json());

            // Fetch my requests (student view)
            const reqStudentRes = await fetch('http://localhost:5000/api/requests/student', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(reqStudentRes.ok) setStudentRequests(await reqStudentRes.json());

            // Fetch admin users if admin
            if (user && user.role === 'admin') {
                const usersRes = await fetch('http://localhost:5000/api/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if(usersRes.ok) setAllUsers(await usersRes.json());
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/update', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(infoData)
            });
            if (response.ok) {
                setInfoMsg('Мәліметтер жаңартылды!');
                setUser({ ...user, name: infoData.name, email: infoData.email });
                localStorage.setItem('user', JSON.stringify({ ...user, name: infoData.name, email: infoData.email }));
            } else {
                setInfoMsg('Қате кетті.');
            }
        } catch (err) {
            setInfoMsg('Сервер қатесі.');
        }
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

    const handleRequest = async (id, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/requests/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if(res.ok) fetchData();
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

    const handleDeleteUser = async (id) => {
        if(!window.confirm('Пайдаланушыны өшіресіз бе?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    if (!user) return <p>Жүктелуде...</p>;

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
            <h2>Жеке кабинет</h2>
            <div style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
                <button className="btn" onClick={() => setActiveTab('info')} style={{ opacity: activeTab === 'info' ? 1 : 0.7 }}>Мәліметтер</button>
                <button className="btn" onClick={() => setActiveTab('my_courses')} style={{ opacity: activeTab === 'my_courses' ? 1 : 0.7 }}>Менің курстарым</button>
                <button className="btn" onClick={() => setActiveTab('enrolled')} style={{ opacity: activeTab === 'enrolled' ? 1 : 0.7 }}>Оқып жатқан курстар</button>
                {user.role === 'admin' && (
                    <Link to="/admin" className="btn" style={{ backgroundColor: '#d9534f', color: 'white', textDecoration: 'none' }}>Админ панелі</Link>
                )}
                <button className="btn" onClick={logout} style={{ marginLeft: 'auto', backgroundColor: '#6c757d' }}>Шығу</button>
            </div>

            <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                
                {/* INFO TAB */}
                {activeTab === 'info' && (
                    <div>
                        <h3>Аккаунтты басқару</h3>
                        {infoMsg && <p style={{ color: 'green', margin: '10px 0' }}>{infoMsg}</p>}
                        <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', marginTop: '20px' }}>
                            <label>Аты-жөні</label>
                            <input type="text" value={infoData.name} onChange={e => setInfoData({...infoData, name: e.target.value})} style={{ padding: '8px' }} />
                            
                            <label>Email</label>
                            <input type="email" value={infoData.email} onChange={e => setInfoData({...infoData, email: e.target.value})} style={{ padding: '8px' }} />
                            
                            <label>Жаңа құпиясөз (өзгерту үшін ғана жазыңыз)</label>
                            <input type="password" value={infoData.password} onChange={e => setInfoData({...infoData, password: e.target.value})} style={{ padding: '8px' }} />
                            
                            <button type="submit" className="btn">Сақтау</button>
                        </form>
                    </div>
                )}

                {/* MY COURSES TAB (Teacher view) */}
                {activeTab === 'my_courses' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Орналастырған курстарым</h3>
                            <Link to="/services" className="btn">Жаңа курс қосу (Уақытша каталогта)</Link>
                        </div>
                        
                        <div style={{ marginTop: '20px' }}>
                            <h4>Курсқа қосылу сұраныстары</h4>
                            {requests.length === 0 ? <p>Сұраныстар жоқ</p> : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {requests.map(req => (
                                        <li key={req.id} style={{ padding: '10px', border: '1px solid var(--border-color)', marginBottom: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <strong>{req.student_name}</strong> ({req.student_email}) <br/>
                                                Курс: {req.course_title}
                                            </div>
                                            <div>
                                                <button onClick={() => handleRequest(req.id, 'approved')} style={{ marginRight: '10px', padding: '5px 10px', background: 'green', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Рұқсат беру</button>
                                                <button onClick={() => handleRequest(req.id, 'rejected')} style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Бермеу</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <h4>Курстар тізімі</h4>
                            {myCourses.length === 0 ? <p>Курстар қосылмаған</p> : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                    {myCourses.map(c => (
                                        <div key={c.id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                                            <h5>{c.title}</h5>
                                            <p>Оқушылар: {c.students_count}</p>
                                            <Link to={`/course/${c.id}`} style={{ color: 'var(--primary-color)', display: 'block', margin: '10px 0' }}>Курсқа өту</Link>
                                            <button onClick={() => handleDeleteCourse(c.id)} style={{ padding: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Өшіру</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ENROLLED COURSES TAB (Student view) */}
                {activeTab === 'enrolled' && (
                    <div>
                        <h3>Оқып жатқан курстар</h3>
                        {studentRequests.length === 0 ? <p>Ешқандай курсқа сұраныс жібермедіңіз</p> : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                                {studentRequests.map(req => (
                                    <div key={req.id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                                        <h5>{req.title}</h5>
                                        <p>Статус: <strong>{req.status === 'pending' ? 'Күтілуде' : req.status === 'approved' ? 'Рұқсат етілді' : 'Қабылданбады'}</strong></p>
                                        {req.status === 'approved' && (
                                            <Link to={`/course/${req.course_id}`} className="btn" style={{ display: 'inline-block', marginTop: '10px', padding: '5px 10px' }}>Оқуды жалғастыру</Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
