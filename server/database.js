const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:QA081020.Em65@db.frpudrafiysomaxuusau.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                "isBlocked" INTEGER DEFAULT 0
            )
        `);

        const adminRes = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);
        if (adminRes.rows.length === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await pool.query(`INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`, ['Admin', 'admin@qadam.kz', hash, 'admin']);
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                teacher_id INTEGER,
                year TEXT,
                updates TEXT,
                students_count INTEGER DEFAULT 0,
                phone TEXT,
                price INTEGER,
                video_url TEXT,
                FOREIGN KEY(teacher_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS lessons (
                id SERIAL PRIMARY KEY,
                course_id INTEGER,
                title TEXT NOT NULL,
                video_url TEXT,
                content_text TEXT,
                FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS tests (
                id SERIAL PRIMARY KEY,
                lesson_id INTEGER,
                FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                test_id INTEGER,
                question_text TEXT NOT NULL,
                type TEXT DEFAULT 'choice',
                option_a TEXT,
                option_b TEXT,
                option_c TEXT,
                option_d TEXT,
                correct_answer TEXT,
                pairs TEXT,
                FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS course_requests (
                id SERIAL PRIMARY KEY,
                course_id INTEGER,
                student_id INTEGER,
                status TEXT DEFAULT 'pending',
                FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
                FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS test_results (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                course_id INTEGER,
                lesson_id INTEGER,
                score INTEGER,
                total_questions INTEGER,
                passed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
                FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                message_text TEXT NOT NULL,
                reply_text TEXT,
                status TEXT DEFAULT 'pending',
                user_read INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Connected to Supabase PostgreSQL database and tables verified.');
    } catch (err) {
        console.error('Database initialization error:', err);
    }
};

initDB();

module.exports = pool;
