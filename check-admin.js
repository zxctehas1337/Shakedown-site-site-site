const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAdmin() {
  try {
    const result = await pool.query(
      'SELECT id, username, email, is_admin, email_verified, password FROM users WHERE is_admin = true'
    );

    console.log('Найдено админов:', result.rows.length);
    
    if (result.rows.length > 0) {
      result.rows.forEach(admin => {
        console.log(`ID: ${admin.id}`);
        console.log(`Username: ${admin.username}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Is Admin: ${admin.is_admin}`);
        console.log(`Email Verified: ${admin.email_verified}`);
        console.log(`Password (base64): ${admin.password}`);
        console.log('---');
      });
    } else {
      console.log('Админы не найдены в базе данных');
    }

    // Проверяем пользователя developer
    const devResult = await pool.query(
      'SELECT id, username, email, is_admin, email_verified, password FROM users WHERE username = $1 OR email = $2',
      ['developer', 'developer@shakedown.com']
    );

    console.log('\nПроверка пользователя developer:');
    console.log('Найдено:', devResult.rows.length);
    
    if (devResult.rows.length > 0) {
      const dev = devResult.rows[0];
      console.log(`ID: ${dev.id}`);
      console.log(`Username: ${dev.username}`);
      console.log(`Email: ${dev.email}`);
      console.log(`Is Admin: ${dev.is_admin}`);
      console.log(`Email Verified: ${dev.email_verified}`);
      console.log(`Password (base64): ${dev.password}`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error.message);
    process.exit(1);
  }
}

checkAdmin();
