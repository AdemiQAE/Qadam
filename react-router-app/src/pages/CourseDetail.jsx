import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';

function CourseDetail() {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const { t } = useContext(AppContext);
    
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [reqStatus, setReqStatus] = useState(null);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);
    
    // For adding lesson
    const [newLesson, setNewLesson] = useState({ title: '', video_url: '', content_text: '' });
    
    // For adding questions
    const [activeLessonId, setActiveLessonId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        type: 'choice',
        question_text: '',
        option_a: '', option_b: '', option_c: '', option_d: '',
        correct_answer: '',
        pairs: [] // For match type: [{left: '', right: ''}]
    });

    useEffect(() => {
        fetchCourse();
        if (user) {
            checkRequestStatus();
            fetchLessons();
            fetchResults();
        }
    }, [id, user]);

    const fetchCourse = async () => {
        try {
            const res = await fetch(`https://qadam-backend-x1d2.onrender.com/api/courses`);
            const data = await res.json();
            const found = data.find(c => c.id === parseInt(id));
            if (found) setCourse(found);
        } catch (e) {
            setError('Курс туралы мәліметті жүктеу мүмкін болмады');
        }
    };

    const fetchLessons = async () => {
        try {
            const res = await fetch(`https://qadam-backend-x1d2.onrender.com/api/courses/${id}/lessons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setLessons(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchResults = async () => {
        try {
            const res = await fetch(`https://qadam-backend-x1d2.onrender.com/api/courses/${id}/results`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setResults(await res.json());
        } catch (e) { console.error(e); }
    };

    const checkRequestStatus = async () => {
        try {
            const res = await fetch('https://qadam-backend-x1d2.onrender.com/api/requests/student', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if(Array.isArray(data)) {
                const req = data.find(r => r.course_id === parseInt(id));
                if (req) setReqStatus(req.status);
            }
        } catch (e) {}
    };

    const handleRequestPermission = async () => {
        try {
            const res = await fetch('https://qadam-backend-x1d2.onrender.com/api/requests', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ course_id: id })
            });
            if (res.ok) {
                setReqStatus('pending');
            } else {
                setError('Қате кетті');
            }
        } catch (e) { setError('Қате кетті'); }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        if(!newLesson.title.trim() || !newLesson.content_text.trim()) {
            alert('Сабақ атауы мен мәтіні бос болмауы керек!');
            return;
        }
        try {
            const res = await fetch(`https://qadam-backend-x1d2.onrender.com/api/courses/${id}/lessons`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newLesson)
            });
            if (res.ok) {
                setNewLesson({ title: '', video_url: '', content_text: '' });
                fetchLessons();
            }
        } catch (e) { console.error(e); }
    };

    const loadQuestions = async (lessonId) => {
        if (activeLessonId === lessonId) {
            setActiveLessonId(null);
            return;
        }
        setActiveLessonId(lessonId);
        try {
            const res = await fetch(`https://qadam-backend-x1d2.onrender.com/api/lessons/${lessonId}/questions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const parsedData = data.map(q => ({
                    ...q,
                    pairs: q.pairs && typeof q.pairs === 'string' ? JSON.parse(q.pairs) : q.pairs
                }));
                setQuestions(parsedData);
            }
        } catch (e) { console.error(e); }
    };

    const handleAddQuestionLocal = () => {
        if(!newQuestion.question_text.trim()) {
            alert('Сұрақ мәтінін жазыңыз!');
            return;
        }
        if(newQuestion.type === 'choice' && (!newQuestion.correct_answer.trim() || !newQuestion.option_a.trim())) {
            alert('Нұсқалар мен дұрыс жауапты толтырыңыз!');
            return;
        }
        if(newQuestion.type === 'text' && !newQuestion.correct_answer.trim()) {
            alert('Дұрыс жауапты жазыңыз!');
            return;
        }
        if(newQuestion.type === 'match' && newQuestion.pairs.length === 0) {
            alert('Кем дегенде бір жұп қосыңыз!');
            return;
        }

        setQuestions([...questions, { ...newQuestion }]);
        setNewQuestion({ type: 'choice', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '', pairs: [] });
    };

    const handleSaveTest = async (lessonId) => {
        if(questions.length === 0) {
            alert('Тестте ең болмағанда бір сұрақ болуы керек!');
            return;
        }
        try {
            const res = await fetch(`https://qadam-backend-x1d2.onrender.com/api/lessons/${lessonId}/questions`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ questions })
            });
            if (res.ok) alert('Тест сақталды!');
        } catch (e) { console.error(e); }
    };

    if (!course) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Жүктелуде...</div>;

    const isAuthor = user && course.teacher_id === user.id;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h2>{course.title}</h2>
            <p style={{ color: 'gray', marginTop: '10px' }}>{t('course-author')} {course.author}</p>
            <p style={{ marginTop: '20px', fontSize: '1.1rem', lineHeight: '1.6' }}>{course.description}</p>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
                <p><strong>{t('course-year')}</strong> {course.year}</p>
                <p><strong>{t('course-price')}</strong> {course.price} ₸</p>
                <p><strong>{t('course-students')}</strong> {course.students_count}</p>
            </div>

            {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

            {!user ? (
                <div style={{ marginTop: '30px' }}>
                    <p>Курсқа жазылу үшін жүйеге кіріңіз.</p>
                    <Link to="/login" className="btn" style={{ display: 'inline-block', marginTop: '10px' }}>Кіру</Link>
                </div>
            ) : !isAuthor && reqStatus === null ? (
                <button className="btn" onClick={handleRequestPermission} style={{ marginTop: '30px', background: '#28a745' }}>Курсты өтуге рұқсат сұрау</button>
            ) : !isAuthor && reqStatus === 'pending' ? (
                <p style={{ marginTop: '30px', color: 'orange', fontWeight: 'bold' }}>Сұраныс жіберілді. Автордың рұқсатын күтіңіз.</p>
            ) : !isAuthor && reqStatus === 'rejected' ? (
                <p style={{ marginTop: '30px', color: 'red', fontWeight: 'bold' }}>Автор сізге бұл курсты оқуға рұқсат бермеді.</p>
            ) : null}

            {(isAuthor || reqStatus === 'approved') && (
                <div style={{ marginTop: '30px' }}>
                    <h3>{t('course-lessons-list')}</h3>
                    
                    {isAuthor && (
                        <div style={{ background: 'var(--bg-body)', padding: '15px', borderRadius: '5px', marginTop: '15px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ marginBottom: '10px' }}>{t('course-add-lesson')}</h4>
                            <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <input required type="text" placeholder={t('course-lesson-title')} value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} style={{ padding: '8px' }} />
                                <input type="url" placeholder={t('course-lesson-video')} value={newLesson.video_url} onChange={e => setNewLesson({...newLesson, video_url: e.target.value})} style={{ padding: '8px' }} />
                                <textarea required placeholder={t('course-lesson-text')} value={newLesson.content_text} onChange={e => setNewLesson({...newLesson, content_text: e.target.value})} style={{ padding: '8px', minHeight: '80px' }} />
                                <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>{t('course-btn-add')}</button>
                            </form>
                        </div>
                    )}
                    
                    {lessons.length === 0 ? <p>{t('course-no-lessons')}</p> : (
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                            {lessons.map(lesson => (
                                <li key={lesson.id} style={{ padding: '15px', border: '1px solid var(--border-color)', marginBottom: '10px', borderRadius: '5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4>{lesson.title}</h4>
                                        <div>
                                            {isAuthor && <button onClick={() => loadQuestions(lesson.id)} className="btn" style={{ marginRight: '10px', background: '#17a2b8' }}>{t('course-btn-test')}</button>}
                                            <Link to={`/course/${course.id}/lesson/${lesson.id}`} className="btn" style={{ padding: '5px 10px' }}>{t('course-btn-start')}</Link>
                                        </div>
                                    </div>

                                    {/* TEST BUILDER */}
                                    {isAuthor && activeLessonId === lesson.id && (
                                        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-body)', border: '1px dashed var(--primary-color)' }}>
                                            <h5>{t('test-title')} ({questions.length})</h5>
                                            
                                            {/* List of current questions */}
                                            {questions.map((q, idx) => (
                                                <div key={idx} style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                                                    <strong>{idx+1}. {q.question_text}</strong> ({q.type})
                                                </div>
                                            ))}

                                            {/* Add Question Form */}
                                            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <h6>{t('test-add-q')}</h6>
                                                <select value={newQuestion.type} onChange={e => setNewQuestion({...newQuestion, type: e.target.value})} style={{ padding: '8px' }}>
                                                    <option value="choice">Нұсқа таңдау (A,B,C,D)</option>
                                                    <option value="text">Мәтін жазу (Еркін жауап)</option>
                                                    <option value="match">Сәйкестендіру (Жұптар)</option>
                                                </select>

                                                <input type="text" placeholder={t('test-q-text')} value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})} style={{ padding: '8px' }} />

                                                {newQuestion.type === 'choice' && (
                                                    <>
                                                        <input type="text" placeholder="А" value={newQuestion.option_a} onChange={e => setNewQuestion({...newQuestion, option_a: e.target.value})} style={{ padding: '8px' }} />
                                                        <input type="text" placeholder="B" value={newQuestion.option_b} onChange={e => setNewQuestion({...newQuestion, option_b: e.target.value})} style={{ padding: '8px' }} />
                                                        <input type="text" placeholder="C" value={newQuestion.option_c} onChange={e => setNewQuestion({...newQuestion, option_c: e.target.value})} style={{ padding: '8px' }} />
                                                        <input type="text" placeholder="D" value={newQuestion.option_d} onChange={e => setNewQuestion({...newQuestion, option_d: e.target.value})} style={{ padding: '8px' }} />
                                                        <input type="text" placeholder="Дұрыс нұсқа (A, B, C, D)" value={newQuestion.correct_answer} onChange={e => setNewQuestion({...newQuestion, correct_answer: e.target.value})} style={{ padding: '8px' }} />
                                                    </>
                                                )}

                                                {newQuestion.type === 'text' && (
                                                    <input type="text" placeholder="Дұрыс жауап" value={newQuestion.correct_answer} onChange={e => setNewQuestion({...newQuestion, correct_answer: e.target.value})} style={{ padding: '8px' }} />
                                                )}

                                                {newQuestion.type === 'match' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <p style={{ fontSize: '0.8rem' }}>Сәйкес жұптарды қосыңыз (мысалы: Алма - Жеміс)</p>
                                                        {newQuestion.pairs.map((p, idx) => (
                                                            <div key={idx}>Жұп: {p.left} - {p.right}</div>
                                                        ))}
                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                            <input id="matchLeft" type="text" placeholder="Сол жақ" style={{ padding: '8px' }} />
                                                            <input id="matchRight" type="text" placeholder="Оң жақ" style={{ padding: '8px' }} />
                                                            <button onClick={() => {
                                                                const l = document.getElementById('matchLeft').value;
                                                                const r = document.getElementById('matchRight').value;
                                                                if(l && r) {
                                                                    setNewQuestion({...newQuestion, pairs: [...newQuestion.pairs, {left: l, right: r}]});
                                                                    document.getElementById('matchLeft').value = '';
                                                                    document.getElementById('matchRight').value = '';
                                                                }
                                                            }} type="button" className="btn" style={{ background: 'var(--primary-color)' }}>Жұп қосу</button>
                                                        </div>
                                                    </div>
                                                )}

                                                <button type="button" onClick={handleAddQuestionLocal} className="btn" style={{ alignSelf: 'flex-start' }}>{t('test-btn-add-q')}</button>
                                                
                                                <hr style={{ margin: '15px 0' }} />
                                                <button type="button" onClick={() => handleSaveTest(lesson.id)} className="btn" style={{ background: '#28a745' }}>{t('test-btn-save')}</button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Test Results Section */}
            {(isAuthor || reqStatus === 'approved') && results.length > 0 && (
                <div style={{ marginTop: '40px', background: 'var(--bg-body)', padding: '20px', borderRadius: '8px' }}>
                    <h3>{t('test-results-title')}</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ background: 'var(--primary-color)', color: 'white' }}>
                                {isAuthor && <th style={{ padding: '10px' }}>Оқушы</th>}
                                <th style={{ padding: '10px' }}>Сабақ</th>
                                <th style={{ padding: '10px' }}>Балл</th>
                                <th style={{ padding: '10px' }}>Уақыты</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {isAuthor && <td style={{ padding: '10px' }}>{r.student_name}</td>}
                                    <td style={{ padding: '10px' }}>{r.lesson_title}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: r.score === r.total_questions ? 'green' : 'orange' }}>{r.score} / {r.total_questions}</td>
                                    <td style={{ padding: '10px', fontSize: '0.9rem' }}>{new Date(r.passed_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CourseDetail;
