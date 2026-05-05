const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres.frpudrafiysomaxuusau:QA081020.Em65@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function migrate() {
    try {
        await pool.query(`ALTER TABLE courses ADD COLUMN video_url TEXT;`);
        console.log("Column added successfully");
    } catch (e) {
        if (e.message.includes('already exists')) {
            console.log("Column already exists");
        } else {
            console.error(e);
        }
    } finally {
        pool.end();
    }
}

migrate();
