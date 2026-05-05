import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LessonDetail() {
    const { id, lessonId } = useParams();
    const { token } = useContext(AuthContext);
    const [lesson, setLesson] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    
    // Test logic
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null); // { score, total }

    useEffect(() => {
        fetchLesson();
        fetchQuestions();
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`https://qadam-backend.onrender.com/api/lessons/${lessonId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setLesson(await res.json());
            } else {
                setError('Сабақты жүктеу мүмкін болмады немесе рұқсатыңыз жоқ.');
            }
        } catch (e) {
            setError('Сервер қатесі');
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`https://qadam-backend.onrender.com/api/lessons/${lessonId}/questions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
                
                // Initialize match questions in answers object
                const initialAns = {};
                data.forEach(q => {
                    if (q.type === 'match') {
                        const pairs = JSON.parse(q.pairs);
                        initialAns[q.id] = pairs.map(p => ({ left: p.left, right: '' }));
                    }
                });
                setAnswers(initialAns);
            }
        } catch (e) { console.error(e); }
    };

    const handleAnswerChange = (qId, val, matchIdx = null) => {
        if (matchIdx !== null) {
            // It's a match question update
            const newAns = [...answers[qId]];
            newAns[matchIdx].right = val;
            setAnswers({ ...answers, [qId]: newAns });
        } else {
            setAnswers({ ...answers, [qId]: val });
        }
    };

    const handleSubmitTest = async () => {
        const hasAnswers = Object.values(answers).some(ans => {
            if (Array.isArray(ans)) return ans.some(a => a.right);
            return !!ans;
        });

        if (!hasAnswers && questions.length > 0) {
            alert('Кем дегенде бір сұраққа жауап беріңіз!');
            return;
        }

        try {
            const res = await fetch(`https://qadam-backend.onrender.com/api/lessons/${lessonId}/submit-test`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ course_id: id, answers })
            });
            if (res.ok) {
                const data = await res.json();
                setResult(data);
            }
        } catch (e) { console.error(e); }
    };

    if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</p>;
    if (!lesson) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Жүктелуде...</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Link to={`/course/${id}`} style={{ color: 'var(--primary-color)', marginBottom: '20px', display: 'inline-block' }}>&larr; Курсқа қайту</Link>
            
            <h2 style={{ marginBottom: '20px' }}>{lesson.title}</h2>
            
            {lesson.video_url && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '20px' }}>
                    <iframe 
                        src={lesson.video_url} 
                        frameBorder="0" 
                        allowFullScreen 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}>
                    </iframe>
                </div>
            )}

            <div style={{ lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '30px', whiteSpace: 'pre-wrap' }}>
                {lesson.content_text}
            </div>

            <hr style={{ margin: '30px 0', borderColor: 'var(--border-color)' }} />

            {questions.length > 0 && (
                <div>
                    <h3>Тақырып бойынша Тест</h3>
                    
                    {result ? (
                        <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-body)', borderRadius: '8px', textAlign: 'center' }}>
                            <h4>Тест аяқталды!</h4>
                            <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>
                                Сіздің нәтижеңіз: <strong style={{ color: result.score === result.total ? 'green' : 'orange' }}>{result.score} / {result.total}</strong>
                            </p>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px' }}>
                            {questions.map((q, i) => (
                                <div key={q.id} style={{ marginBottom: '25px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-body)' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>{i + 1}. {q.question_text}</p>
                                    
                                    {q.type === 'choice' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {['A', 'B', 'C', 'D'].map(opt => {
                                                const optKey = `option_${opt.toLowerCase()}`;
                                                if (!q[optKey]) return null;
                                                return (
                                                    <label key={opt} style={{ cursor: 'pointer', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '5px' }}>
                                                        <input 
                                                            type="radio" 
                                                            name={`q_${q.id}`} 
                                                            value={opt} 
                                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                            style={{ marginRight: '10px' }} 
                                                        />
                                                        <strong>{opt}:</strong> {q[optKey]}
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {q.type === 'text' && (
                                        <input 
                                            type="text" 
                                            placeholder="Жауабыңызды осында жазыңыз..." 
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)' }}
                                        />
                                    )}

                                    {q.type === 'match' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontSize: '0.9rem', color: 'gray' }}>Сәйкес нұсқаны таңдаңыз:</p>
                                            {JSON.parse(q.pairs).map((p, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    <div style={{ flex: 1, padding: '10px', background: 'var(--bg-card)', borderRadius: '5px' }}>{p.left}</div>
                                                    <span>&rarr;</span>
                                                    <select 
                                                        onChange={(e) => handleAnswerChange(q.id, e.target.value, idx)} 
                                                        style={{ flex: 1, padding: '10px', borderRadius: '5px' }}
                                                    >
                                                        <option value="">Таңдаңыз...</option>
                                                        {JSON.parse(q.pairs).map(pairOpt => (
                                                            <option key={pairOpt.right} value={pairOpt.right}>{pairOpt.right}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button className="btn" onClick={handleSubmitTest} style={{ marginTop: '15px', width: '100%', padding: '15px', fontSize: '1.1rem', background: '#28a745' }}>
                                Жауаптарды жіберу және Нәтижені көру
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LessonDetail;
