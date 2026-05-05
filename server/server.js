const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./database');

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
        const result = await pool.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`, [name, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
    } catch (e) {
        if (e.message.includes('unique')) return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.isBlocked === 1) return res.status(403).json({ error: 'Your account is blocked' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/auth/update', verifyToken, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let updateQuery = `UPDATE users SET name = $1, email = $2 WHERE id = $3`;
        let params = [name, email, req.userId];
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery = `UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4`;
            params = [name, email, hashedPassword, req.userId];
        }

        await pool.query(updateQuery, params);
        res.json({ message: 'User updated successfully' });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- COURSES ENDPOINTS ---
app.get('/api/courses', async (req, res) => {
    try {
        const result = await pool.query(`SELECT courses.*, users.name as author FROM courses JOIN users ON courses.teacher_id = users.id`);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/courses', verifyToken, async (req, res) => {
    const { title, description, year, phone, price } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO courses (title, description, teacher_id, year, updates, phone, price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [title, description, req.userId, year, new Date().toISOString().split('T')[0], phone, price]
        );
        res.status(201).json({ message: 'Course created', id: result.rows[0].id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/courses/my', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM courses WHERE teacher_id = $1`, [req.userId]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/courses/:id', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT teacher_id FROM courses WHERE id = $1`, [req.params.id]);
        const row = result.rows[0];
        if (!row) return res.status(404).json({ error: 'Course not found' });
        
        if (req.userRole === 'admin' || row.teacher_id === req.userId) {
            await pool.query(`DELETE FROM courses WHERE id = $1`, [req.params.id]);
            res.json({ message: 'Course deleted' });
        } else {
            res.status(403).json({ error: 'Unauthorized' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- REQUESTS ENDPOINTS ---
app.post('/api/requests', verifyToken, async (req, res) => {
    const { course_id } = req.body;
    try {
        const result = await pool.query(`SELECT * FROM course_requests WHERE course_id = $1 AND student_id = $2`, [course_id, req.userId]);
        if (result.rows.length > 0) return res.status(400).json({ error: 'Request already sent' });
        
        await pool.query(`INSERT INTO course_requests (course_id, student_id) VALUES ($1, $2)`, [course_id, req.userId]);
        res.status(201).json({ message: 'Request sent successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/requests/student', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT course_requests.*, courses.title, courses.price FROM course_requests JOIN courses ON course_requests.course_id = courses.id WHERE student_id = $1`, [req.userId]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/requests/teacher', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT course_requests.id, course_requests.status, courses.title as course_title, users.name as student_name, users.email as student_email
            FROM course_requests 
            JOIN courses ON course_requests.course_id = courses.id 
            JOIN users ON course_requests.student_id = users.id
            WHERE courses.teacher_id = $1 AND course_requests.status = 'pending'
        `, [req.userId]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/requests/:id', verifyToken, async (req, res) => {
    const { status } = req.body;
    try {
        const result = await pool.query(`
            SELECT courses.teacher_id, courses.id as course_id FROM course_requests 
            JOIN courses ON course_requests.course_id = courses.id 
            WHERE course_requests.id = $1
        `, [req.params.id]);
        const row = result.rows[0];
        if (!row) return res.status(404).json({ error: 'Request not found' });
        if (row.teacher_id !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

        await pool.query(`UPDATE course_requests SET status = $1 WHERE id = $2`, [status, req.params.id]);
        if(status === 'approved') {
            await pool.query(`UPDATE courses SET students_count = students_count + 1 WHERE id = $1`, [row.course_id]);
        }
        res.json({ message: `Request ${status}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- ADMIN ENDPOINTS ---
app.get('/api/users', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const result = await pool.query(`SELECT id, name, email, role, "isBlocked" as isBlocked FROM users`);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/users/:id/block', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { isBlocked } = req.body;
    try {
        await pool.query(`UPDATE users SET "isBlocked" = $1 WHERE id = $2`, [isBlocked ? 1 : 0, req.params.id]);
        res.json({ message: 'User status updated' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/users/:id/role', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { role } = req.body;
    try {
        await pool.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, req.params.id]);
        res.json({ message: 'User role updated' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/users/:id', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    try {
        await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- LESSONS & TESTS ---
app.get('/api/courses/:courseId/lessons', verifyToken, async (req, res) => {
    try {
        const courseRes = await pool.query(`SELECT teacher_id FROM courses WHERE id = $1`, [req.params.courseId]);
        const course = courseRes.rows[0];
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        const reqRes = await pool.query(`SELECT status FROM course_requests WHERE course_id = $1 AND student_id = $2`, [req.params.courseId, req.userId]);
        const reqStatus = reqRes.rows[0];

        const isFree = course.price == 0 || course.price === '0' || String(course.price).toLowerCase() === 'тегін';

        if (course.teacher_id !== req.userId && req.userRole !== 'admin' && !isFree && (!reqStatus || reqStatus.status !== 'approved')) {
            return res.status(403).json({ error: 'You do not have permission to view this course content' });
        }

        const lessonsRes = await pool.query(`SELECT * FROM lessons WHERE course_id = $1`, [req.params.courseId]);
        res.json(lessonsRes.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/courses/:courseId/lessons', verifyToken, async (req, res) => {
    try {
        const courseRes = await pool.query(`SELECT teacher_id FROM courses WHERE id = $1`, [req.params.courseId]);
        const course = courseRes.rows[0];
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        if (course.teacher_id !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to add lessons to this course' });
        }

        const { title, video_url, content_text } = req.body;
        const result = await pool.query(`INSERT INTO lessons (course_id, title, video_url, content_text) VALUES ($1, $2, $3, $4) RETURNING id`, 
            [req.params.courseId, title, video_url, content_text]);
        res.status(201).json({ message: 'Lesson created successfully', id: result.rows[0].id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/lessons/:lessonId', verifyToken, async (req, res) => {
    try {
        const lessonRes = await pool.query(`SELECT course_id FROM lessons WHERE id = $1`, [req.params.lessonId]);
        const lesson = lessonRes.rows[0];
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

        const courseRes = await pool.query(`SELECT teacher_id FROM courses WHERE id = $1`, [lesson.course_id]);
        const course = courseRes.rows[0];

        if (course.teacher_id !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await pool.query(`DELETE FROM lessons WHERE id = $1`, [req.params.lessonId]);
        res.json({ message: 'Lesson deleted successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/lessons/:lessonId', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM lessons WHERE id = $1`, [req.params.lessonId]);
        const lesson = result.rows[0];
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
        res.json(lesson);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- TESTS & QUESTIONS ---
app.get('/api/lessons/:lessonId/questions', verifyToken, async (req, res) => {
    try {
        const testRes = await pool.query(`SELECT id FROM tests WHERE lesson_id = $1`, [req.params.lessonId]);
        const test = testRes.rows[0];
        if (!test) return res.json([]);

        const questionsRes = await pool.query(`SELECT * FROM questions WHERE test_id = $1`, [test.id]);
        const rows = questionsRes.rows;
        
        const safeRows = req.userRole === 'admin' ? rows : rows.map(r => ({...r, correct_answer: undefined}));
        res.json(safeRows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/lessons/:lessonId/questions', verifyToken, async (req, res) => {
    const { questions } = req.body;
    if (!questions || !questions.length) return res.status(400).json({ error: 'No questions provided' });

    try {
        let testRes = await pool.query(`SELECT id FROM tests WHERE lesson_id = $1`, [req.params.lessonId]);
        let testId;
        
        if (testRes.rows.length === 0) {
            const insertTest = await pool.query(`INSERT INTO tests (lesson_id) VALUES ($1) RETURNING id`, [req.params.lessonId]);
            testId = insertTest.rows[0].id;
        } else {
            testId = testRes.rows[0].id;
            await pool.query(`DELETE FROM questions WHERE test_id = $1`, [testId]);
        }

        for (let q of questions) {
            await pool.query(`INSERT INTO questions (test_id, question_text, type, option_a, option_b, option_c, option_d, correct_answer, pairs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
                [testId, q.question_text, q.type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.pairs ? JSON.stringify(q.pairs) : null]);
        }

        res.status(201).json({ message: 'Questions added' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/lessons/:lessonId/submit-test', verifyToken, async (req, res) => {
    const { answers, course_id } = req.body;
    try {
        const testRes = await pool.query(`SELECT id FROM tests WHERE lesson_id = $1`, [req.params.lessonId]);
        const test = testRes.rows[0];
        if (!test) return res.status(404).json({ error: 'Test not found' });

        const questionsRes = await pool.query(`SELECT * FROM questions WHERE test_id = $1`, [test.id]);
        const questions = questionsRes.rows;
        
        let score = 0;
        questions.forEach(q => {
            const userAns = answers[q.id];
            if (q.type === 'choice' || q.type === 'text') {
                if (userAns && userAns.toString().trim().toLowerCase() === q.correct_answer.toString().trim().toLowerCase()) {
                    score++;
                }
            } else if (q.type === 'match') {
                if (userAns && JSON.stringify(userAns) === q.pairs) {
                    score++;
                }
            }
        });

        await pool.query(`INSERT INTO test_results (user_id, course_id, lesson_id, score, total_questions) VALUES ($1, $2, $3, $4, $5)`,
            [req.userId, course_id, req.params.lessonId, score, questions.length]);
        res.json({ score, total: questions.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/courses/:courseId/results', verifyToken, async (req, res) => {
    try {
        const query = req.userRole === 'admin' 
            ? `SELECT tr.*, u.name as student_name, l.title as lesson_title FROM test_results tr JOIN users u ON tr.user_id = u.id JOIN lessons l ON tr.lesson_id = l.id WHERE tr.course_id = $1`
            : `SELECT tr.*, l.title as lesson_title FROM test_results tr JOIN lessons l ON tr.lesson_id = l.id WHERE tr.course_id = $1 AND tr.user_id = $2`;
        
        const params = req.userRole === 'admin' ? [req.params.courseId] : [req.params.courseId, req.userId];
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- MESSAGES (CONTACT) ---
app.post('/api/messages', verifyToken, async (req, res) => {
    const { message_text } = req.body;
    if (!message_text || !message_text.trim()) return res.status(400).json({ error: 'Empty message' });
    try {
        await pool.query(`INSERT INTO messages (user_id, message_text) VALUES ($1, $2)`, [req.userId, message_text]);
        res.status(201).json({ message: 'Message sent' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/messages/admin', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { user_id, message_text } = req.body;
    if (!message_text || !message_text.trim()) return res.status(400).json({ error: 'Empty message' });
    try {
        await pool.query(`INSERT INTO messages (user_id, message_text, reply_text, status, user_read) VALUES ($1, 'Админнен хабарлама', $2, 'replied', 0)`, [user_id, message_text]);
        res.json({ message: 'Sent' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/messages', verifyToken, async (req, res) => {
    try {
        let query = `SELECT m.*, u.name as user_name, u.email as user_email FROM messages m JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC`;
        let params = [];
        
        if (req.userRole !== 'admin') {
            query = `SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC`;
            params = [req.userId];
        }
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/messages/:id/reply', verifyToken, async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
    const { reply_text } = req.body;
    try {
        await pool.query(`UPDATE messages SET reply_text = $1, status = 'replied', user_read = 0 WHERE id = $2`, [reply_text, req.params.id]);
        res.json({ message: 'Replied successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/api/messages/:id/read', verifyToken, async (req, res) => {
    try {
        await pool.query(`UPDATE messages SET user_read = 1 WHERE id = $1 AND user_id = $2`, [req.params.id, req.userId]);
        res.json({ message: 'Message marked as read' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
