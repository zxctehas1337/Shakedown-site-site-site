// Скрипт создания админа
// Запуск: node server/scripts/create-admin.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  const username = 'developer';
  const email = 'developer@shakedown.com';
  const password = Buffer.from('SHAKEDOWN-PROJECT-EASY').toString('base64');

  try {
    // Проверяем существует ли уже
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existing.rows.length > 0) {
      console.log('❌ Пользователь уже существует');
      process.exit(1);
    }

    // Создаём админа
    const result = await pool.query(
      `INSERT INTO users (username, email, password, is_admin, email_verified, subscription)
       VALUES ($1, $2, $3, true, true, 'premium')
       RETURNING id, username, email`,
      [username, email, password]
    );

    console.log('✅ Админ создан:');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Username: ${result.rows[0].username}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Password: SHAKEDOWN-PROJECT-EASY`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

createAdmin();
