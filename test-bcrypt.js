import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testBcrypt() {
  try {
    // Получаем админа из БД
    const result = await pool.query(
      'SELECT id, username, password FROM users WHERE username = $1',
      ['admin']
    );

    if (result.rows.length === 0) {
      console.log('❌ Админ не найден');
      process.exit(1);
    }

    const admin = result.rows[0];
    const testPassword = 'SHAKEDOWN-PROJECT-EASY';

    console.log('🔍 Тестирование bcrypt сравнения:');
    console.log(`Username: ${admin.username}`);
    console.log(`Stored hash (first 50): ${admin.password.substring(0, 50)}`);
    console.log(`Test password: ${testPassword}`);
    console.log('');

    // Тест 1: Прямое сравнение с bcrypt
    console.log('Test 1: bcrypt.compare()');
    const match = await new Promise((resolve, reject) => {
      bcrypt.compare(testPassword, admin.password, (error, same) => {
        if (error) return reject(error);
        resolve(same);
      });
    });
    console.log(`Result: ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
    console.log('');

    // Тест 2: Проверим, может ли пароль быть в другом формате
    console.log('Test 2: Проверка других форматов');
    console.log(`Пароль === хеш: ${testPassword === admin.password}`);
    
    const base64Encoded = Buffer.from(testPassword).toString('base64');
    console.log(`Base64 encoded: ${base64Encoded}`);
    console.log(`Пароль (base64) === хеш: ${base64Encoded === admin.password}`);
    
    try {
      const decoded = Buffer.from(admin.password, 'base64').toString('utf-8');
      console.log(`Decoded from base64: ${decoded}`);
      console.log(`Decoded === пароль: ${decoded === testPassword}`);
    } catch (e) {
      console.log(`Не удалось декодировать из base64: ${e.message}`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

await testBcrypt();
