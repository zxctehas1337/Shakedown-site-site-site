const { getPool } = require('../_lib/db');
const { mapUserFromDb } = require('../_lib/userMapper');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { usernameOrEmail, password } = req.body;
  const pool = getPool();

  try {
    const encodedPassword = Buffer.from(password).toString('base64');
    
    const result = await pool.query(
      `SELECT id, username, email, password, subscription, registered_at, is_admin, is_banned, email_verified, settings 
       FROM users 
       WHERE (username = $1 OR email = $1) AND password = $2`,
      [usernameOrEmail, encodedPassword]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Неверный логин или пароль' });
    }

    const dbUser = result.rows[0];

    if (dbUser.is_banned) {
      return res.json({ success: false, message: 'Ваш аккаунт заблокирован' });
    }

    res.json({ success: true, message: 'Вход выполнен!', data: mapUserFromDb(dbUser) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};
