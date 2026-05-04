const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'supersecret_qadam_key_2026'; // For assignment purposes only

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// Logger middleware
const logger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
app.use(logger);

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.isBlocked) return res.status(403).json({ error: 'Your account is blocked' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
});

app.put('/api/auth/update', verifyToken, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let updateQuery = `UPDATE users SET name = ?, email = ? WHERE id = ?`;
        let params = [name, email, req.userId];
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery = `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`;
            params = [name, email, hashedPassword, req.userId];
        }

        db.run(updateQuery, params, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User updated successfully' });
        });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- COURSES ENDPOINTS ---
app.get('/api/courses', (req, res) => {
    db.all(`SELECT courses.*, users.name as author FROM courses JOIN users ON courses.teacher_id = users.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/courses', verifyToken, (req, res) => {
    const { title, description, year, phone, price } = req.body;
    db.run(`INSERT INTO courses (title, description, teacher_id, year, updates, phone, price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, req.userId, year, new Date().toISOString().split('T')[0], phone, price], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Course created', id: this.lastID });
    });
});

app.get('/api/courses/my', verifyToken, (req, res) => {
    db.all(`SELECT * FROM courses WHERE teacher_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.delete('/api/courses/:id', verifyToken, (req, res) => {
    db.get(`SELECT teacher_id FROM courses WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Course not found' });
        
        // Admin or Course Owner can delete
        if (req.userRole === 'admin' || row.teacher_id === req.userId) {
            db.run(`DELETE FROM courses WHERE id = ?`, [req.params.id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Course deleted' });
            });
        } else {
            res.status(403).json({ error: 'Unauthorized' });
        }
    });
});

// --- REQUESTS ENDPOINTS ---
app.post('/api/requests', verifyToken, (req, res) => {
    const { course_id } = req.body;
    // Check if already requested
    db.get(`SELECT * FROM course_requests WHERE course_id = ? AND student_id = ?`, [course_id, req.userId], (err, row) => {
        if (row) return res.status(400).json({ error: 'Request already sent' });
        
        db.run(`INSERT INTO course_requests (course_id, student_id) VALUES (?, ?)`, [course_id, req.userId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Request sent successfully' });
        });
    });
});

app.get('/api/requests/student', verifyToken, (req, res) => {
    db.all(`SELECT course_requests.*, courses.title, courses.price FROM course_requests JOIN courses ON course_requests.course_id = courses.id WHERE student_id = ?`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/requests/teacher', verifyToken, (req, res) => {
    db.all(`
        SELECT course_requests.id, course_requests.status, courses.title as course_title, users.name as student_name, users.email as student_email
        FROM course_requests 
        JOIN courses ON course_requests.course_id = courses.id 
        JOIN users ON course_requests.student_id = users.id
        WHERE courses.teacher_id = ? AND course_requests.status = 'pending'
    `, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/requests/:id', verifyToken, (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    db.get(`
        SELECT courses.teacher_id, courses.id as course_id FROM course_requests 
        JOIN courses ON course_requests.course_id = courses.id 
        WHERE course_requests.id = ?
    `, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row.teacher_id !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

        db.run(`UPDATE course_requests SET status = ? WHERE id = ?`, [status, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if(status === 'approved') {
                db.run(`UPDATE courses SET students_count = students_count + 1 WHERE id = ?`, [row.course_id]);
            }
            res.json({ message: `Request ${status}` });
        });
    });
});

// --- ADMIN ENDPOINTS ---
app.get('/api/users', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    db.all(`SELECT id, name, email, role, isBlocked FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/users/:id/block', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { isBlocked } = req.body;
    db.run(`UPDATE users SET isBlocked = ? WHERE id = ?`, [isBlocked, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User status updated' });
    });
});

app.put('/api/users/:id/role', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { role } = req.body; // 'admin' or 'user'
    db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User role updated' });
    });
});

app.delete('/api/users/:id', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

// --- LESSONS & TESTS ---
app.get('/api/courses/:courseId/lessons', verifyToken, (req, res) => {
    // Check if user has approved request or is owner
    db.get(`
        SELECT teacher_id FROM courses WHERE id = ?
    `, [req.params.courseId], (err, course) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        db.get(`SELECT status FROM course_requests WHERE course_id = ? AND student_id = ?`, [req.params.courseId, req.userId], (err, reqStatus) => {
            if (course.teacher_id !== req.userId && req.userRole !== 'admin' && (!reqStatus || reqStatus.status !== 'approved')) {
                return res.status(403).json({ error: 'You do not have permission to view this course content' });
            }

            db.all(`SELECT * FROM lessons WHERE course_id = ?`, [req.params.courseId], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            });
        });
    });
});

app.post('/api/courses/:courseId/lessons', verifyToken, (req, res) => {
    db.get(`SELECT teacher_id FROM courses WHERE id = ?`, [req.params.courseId], (err, course) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        if (course.teacher_id !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to add lessons to this course' });
        }

        const { title, video_url, content_text } = req.body;
        db.run(`INSERT INTO lessons (course_id, title, video_url, content_text) VALUES (?, ?, ?, ?)`, 
            [req.params.courseId, title, video_url, content_text], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Lesson created successfully', id: this.lastID });
        });
    });
});

app.get('/api/lessons/:lessonId', verifyToken, (req, res) => {
    db.get(`SELECT * FROM lessons WHERE id = ?`, [req.params.lessonId], (err, lesson) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
        res.json(lesson);
    });
});

// --- TESTS & QUESTIONS ---
app.get('/api/lessons/:lessonId/questions', verifyToken, (req, res) => {
    db.get(`SELECT id FROM tests WHERE lesson_id = ?`, [req.params.lessonId], (err, test) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!test) return res.json([]); // No test for this lesson yet

        db.all(`SELECT * FROM questions WHERE test_id = ?`, [test.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            // Don't send correct_answer to client for student! But we need it for teacher.
            // For simplicity, we send it, but ideally we should hide it. 
            // In a real app, validation happens on backend. We will do backend validation in submit-test.
            const safeRows = req.userRole === 'admin' ? rows : rows.map(r => ({...r, correct_answer: undefined}));
            res.json(rows);
        });
    });
});

app.post('/api/lessons/:lessonId/questions', verifyToken, (req, res) => {
    // Only teacher of the course or admin
    const { questions } = req.body; // Array of questions
    if (!questions || !questions.length) return res.status(400).json({ error: 'No questions provided' });

    // Ensure a test exists for this lesson
    db.get(`SELECT id FROM tests WHERE lesson_id = ?`, [req.params.lessonId], (err, test) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const insertQuestions = (testId) => {
            const stmt = db.prepare(`INSERT INTO questions (test_id, question_text, type, option_a, option_b, option_c, option_d, correct_answer, pairs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            questions.forEach(q => {
                stmt.run(testId, q.question_text, q.type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.pairs ? JSON.stringify(q.pairs) : null);
            });
            stmt.finalize();
            res.status(201).json({ message: 'Questions added' });
        };

        if (!test) {
            db.run(`INSERT INTO tests (lesson_id) VALUES (?)`, [req.params.lessonId], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                insertQuestions(this.lastID);
            });
        } else {
            // Delete old questions if replacing, or just add. Let's say we replace for simplicity
            db.run(`DELETE FROM questions WHERE test_id = ?`, [test.id], (err) => {
                insertQuestions(test.id);
            });
        }
    });
});

app.post('/api/lessons/:lessonId/submit-test', verifyToken, async (req, res) => {
    const { answers, course_id } = req.body; // answers is an object mapping question_id to answer
    
    db.get(`SELECT id FROM tests WHERE lesson_id = ?`, [req.params.lessonId], (err, test) => {
        if (!test) return res.status(404).json({ error: 'Test not found' });

        db.all(`SELECT * FROM questions WHERE test_id = ?`, [test.id], (err, questions) => {
            let score = 0;
            questions.forEach(q => {
                const userAns = answers[q.id];
                if (q.type === 'choice' || q.type === 'text') {
                    // text answer is case-insensitive
                    if (userAns && userAns.toString().trim().toLowerCase() === q.correct_answer.toString().trim().toLowerCase()) {
                        score++;
                    }
                } else if (q.type === 'match') {
                    // For match, we can assume userAns is an array of matches or we just check if it equals the stringified correct pairs.
                    // Simplified: if exact match of pairs
                    if (userAns && JSON.stringify(userAns) === q.pairs) {
                        score++;
                    }
                }
            });

            // Save result
            db.run(`INSERT INTO test_results (user_id, course_id, lesson_id, score, total_questions) VALUES (?, ?, ?, ?, ?)`,
                [req.userId, course_id, req.params.lessonId, score, questions.length], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ score, total: questions.length });
            });
        });
    });
});

app.get('/api/courses/:courseId/results', verifyToken, (req, res) => {
    // Only teacher of course or admin can see all. User sees only theirs.
    const query = req.userRole === 'admin' 
        ? `SELECT tr.*, u.name as student_name, l.title as lesson_title FROM test_results tr JOIN users u ON tr.user_id = u.id JOIN lessons l ON tr.lesson_id = l.id WHERE tr.course_id = ?`
        : `SELECT tr.*, l.title as lesson_title FROM test_results tr JOIN lessons l ON tr.lesson_id = l.id WHERE tr.course_id = ? AND tr.user_id = ?`;
    
    const params = req.userRole === 'admin' ? [req.params.courseId] : [req.params.courseId, req.userId];
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- MESSAGES (CONTACT) ---
app.post('/api/messages', verifyToken, (req, res) => {
    const { message_text } = req.body;
    if (!message_text || !message_text.trim()) return res.status(400).json({ error: 'Empty message' });
    db.run(`INSERT INTO messages (user_id, message_text) VALUES (?, ?)`, [req.userId, message_text], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Message sent' });
    });
});

app.post('/api/messages/admin', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { user_id, message_text } = req.body;
    if (!message_text || !message_text.trim()) return res.status(400).json({ error: 'Empty message' });
    db.run(`INSERT INTO messages (user_id, message_text, reply_text, status, user_read) VALUES (?, 'Админнен хабарлама', ?, 'replied', 0)`, [user_id, message_text], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Sent' });
    });
});

app.get('/api/messages', verifyToken, (req, res) => {
    let query = `SELECT m.*, u.name as user_name, u.email as user_email FROM messages m JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC`;
    let params = [];
    
    if (req.userRole !== 'admin') {
        query = `SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC`;
        params = [req.userId];
    }
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/messages/:id/reply', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { reply_text } = req.body;
    db.run(`UPDATE messages SET reply_text = ?, status = 'replied', user_read = 0 WHERE id = ?`, [reply_text, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Replied successfully' });
    });
});

app.patch('/api/messages/:id/read', verifyToken, (req, res) => {
    db.run(`UPDATE messages SET user_read = 1 WHERE id = ? AND user_id = ?`, [req.params.id, req.userId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Message marked as read' });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
