const { useState, useEffect } = React;

function Quiz() {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const question = {
        title: "React.js дегеніміз не?",
        options: [
            "Бағдарламалау тілі",
            "Дерекқор басқару жүйесі",
            "Пайдаланушы интерфейстерін құруға арналған JavaScript кітапханасы",
            "Браузер"
        ],
        correctAnswer: 2
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;
        setIsSubmitted(true);
        if (selectedOption === question.correctAnswer) {
            setScore(1);
        } else {
            setScore(0);
        }
    };

    return (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-body)', color: 'var(--text-main)' }}>
            <h3>Шағын тест (Quiz)</h3>
            <p style={{ marginTop: '10px' }}><strong>Сұрақ:</strong> {question.title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                {question.options.map((opt, idx) => (
                    <label key={idx} style={{
                        cursor: 'pointer',
                        padding: '10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '5px',
                        backgroundColor: selectedOption === idx ? 'var(--btn-color)' : 'transparent',
                        color: selectedOption === idx ? '#fff' : 'inherit',
                        transition: '0.3s'
                    }}>
                        <input
                            type="radio"
                            name="quiz"
                            value={idx}
                            onChange={() => setSelectedOption(idx)}
                            disabled={isSubmitted}
                            style={{ marginRight: '10px' }}
                        />
                        {opt}
                    </label>
                ))}
            </div>
            {!isSubmitted ? (
                <button onClick={handleSubmit} className="btn" style={{ marginTop: '15px' }}>Жауап беру</button>
            ) : (
                <div style={{ marginTop: '15px', fontWeight: 'bold', padding: '10px', borderRadius: '5px', backgroundColor: score === 1 ? 'rgba(0,128,0,0.1)' : 'rgba(255,0,0,0.1)' }}>
                    {score === 1 ?
                        <span style={{ color: 'green' }}>Дұрыс! Сіз 1 ұпай алдыңыз.</span> :
                        <span style={{ color: 'red' }}>Қате! Дұрыс жауап: "{question.options[question.correctAnswer]}"</span>
                    }
                </div>
            )}
        </div>
    );
}

function App() {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({ id: null, title: '', description: '', price: '', videoUrl: '' });
    const [isEditing, setIsEditing] = useState(false);

    // Read: API-ден (courses.json) деректер алу
    useEffect(() => {
        fetch('courses.json')
            .then(res => res.json())
            .then(data => {
                setCourses(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Деректерді алуда қате шықты:", err);
                setLoading(false);
            });
    }, []);

    //4.3
    const handleSave = (e) => {
        e.preventDefault();
        if (isEditing) {
            setCourses(courses.map(c => c.id === formData.id ? { ...formData } : c));
            setIsEditing(false);
        } else {
            const newCourse = { ...formData, id: Date.now() };
            setCourses([newCourse, ...courses]);
        }
        setFormData({ id: null, title: '', description: '', price: '', videoUrl: '' });
    };

    //4.4
    const handleDelete = (id) => {
        if (window.confirm("Бұл курсты өшіргіңіз келе ме?")) {
            setCourses(courses.filter(c => c.id !== id));
        }
    };

    //4.5
    const handleEdit = (course) => {
        setFormData(course);
        setIsEditing(true);
        window.scrollTo({ top: document.getElementById('course-form').offsetTop - 50, behavior: 'smooth' });
    };

    //4.6
    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <hr style={{ margin: '40px 0', borderColor: 'var(--border-color)' }} />
            <h2 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '10px' }}>Курстарды басқару (React CRUD)</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '30px' }}>
                Бұл бөлім Практикалық жұмыс №4 талаптарына сай React арқылы жасалды.
            </p>

            {/*4.7*/}
            <div style={{ margin: '20px 0' }}>
                <input
                    type="text"
                    placeholder="Курсты іздеу (атауы немесе сипаттамасы бойынша)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem' }}
                />
            </div>

            {/*4.8*/}
            <form id="course-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '25px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-body)' }}>
                <h3 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>{isEditing ? 'Курсты өңдеу' : 'Жаңа курс қосу'}</h3>

                <input required type="text" placeholder="Курс атауы" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }} />

                <textarea required placeholder="Сипаттамасы" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }} />

                <input required type="number" placeholder="Бағасы (₸)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }} />

                <input required type="url" placeholder="Видео URL (Мысалы: https://www.youtube.com/embed/...)" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }} />

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" className="btn" style={{ flex: 1 }}>{isEditing ? 'Сақтау' : 'Қосу'}</button>
                    {isEditing && (
                        <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#6c757d' }} onClick={() => { setIsEditing(false); setFormData({ id: null, title: '', description: '', price: '', videoUrl: '' }); }}>
                            Болдырмау
                        </button>
                    )}
                </div>
            </form>

            {/*4.2*/}
            <div style={{ marginTop: '40px' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '20px' }}>Барлық курстар тізімі</h3>
                {loading ? <p style={{ textAlign: 'center', color: 'var(--text-main)' }}>Деректер жүктелуде...</p> :
                    //4.2
                    filteredCourses.length > 0 ? filteredCourses.map(course => (
                        <div key={course.id} style={{ padding: '25px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '25px', backgroundColor: 'var(--bg-body)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ color: 'var(--text-main)', marginBottom: '10px', fontSize: '1.4rem' }}>{course.title}</h3>
                            <p style={{ color: 'var(--text-main)', marginBottom: '15px', lineHeight: '1.6' }}>{course.description}</p>
                            <p style={{ fontWeight: 'bold', color: 'var(--btn-color)', fontSize: '1.1rem', marginBottom: '20px' }}>Бағасы: {course.price} ₸</p>

                            {course.videoUrl && (
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
                                    <iframe
                                        src={course.videoUrl}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    ></iframe>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleEdit(course)} className="btn" style={{ backgroundColor: '#f0ad4e', flex: 1 }}>Өңдеу</button>
                                <button onClick={() => handleDelete(course.id)} className="btn" style={{ backgroundColor: '#d9534f', flex: 1 }}>Өшіру</button>
                            </div>
                        </div>
                    )) : <p style={{ textAlign: 'center', color: 'var(--text-main)' }}>Сұранысқа сай курстар табылмады.</p>
                }
            </div>

            <hr style={{ margin: '40px 0', borderColor: 'var(--border-color)' }} />
            <Quiz />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(<App />);
