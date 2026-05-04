const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // 1. Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            isBlocked INTEGER DEFAULT 0
        )`, (err) => {
            if (!err) {
                // Create a default admin user if table is empty
                db.get(`SELECT id FROM users WHERE role = 'admin'`, async (err, row) => {
                    if (!row) {
                        const hash = await bcrypt.hash('admin123', 10);
                        db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['Admin', 'admin@qadam.kz', hash, 'admin']);
                    }
                });
            }
        });

        // 2. Courses Table
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            teacher_id INTEGER,
            year TEXT,
            updates TEXT,
            students_count INTEGER DEFAULT 0,
            phone TEXT,
            price INTEGER,
            FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        // 3. Lessons Table
        db.run(`CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER,
            title TEXT NOT NULL,
            video_url TEXT,
            content_text TEXT,
            FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
        )`);

        // 4. Tests Table
        db.run(`CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER,
            FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
        )`);

        // 5. Questions Table
        db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER,
            question_text TEXT NOT NULL,
            type TEXT DEFAULT 'choice', -- 'choice', 'text', 'match'
            option_a TEXT,
            option_b TEXT,
            option_c TEXT,
            option_d TEXT,
            correct_answer TEXT,
            pairs TEXT, -- JSON string for matching pairs
            FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE
        )`);

        // 6. CourseRequests Table
        db.run(`CREATE TABLE IF NOT EXISTS course_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER,
            student_id INTEGER,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        // 7. Test Results Table
        db.run(`CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            course_id INTEGER,
            lesson_id INTEGER,
            score INTEGER,
            total_questions INTEGER,
            passed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
        )`);

        // 8. Messages (Support Tickets) Table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            message_text TEXT NOT NULL,
            reply_text TEXT,
            status TEXT DEFAULT 'pending',
            user_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
    }
});

module.exports = db;
