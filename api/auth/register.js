const { getPool } = require('../_lib/db');
const { generateVerificationCode, sendVerificationEmail } = require('../_lib/email');
const { mapUserFromDb } = require('../_lib/userMapper');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, email, password } = req.body;
  const pool = getPool();

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.username === username) {
        return res.json({ success: false, message: 'Пользователь с таким логином уже существует' });
      }
      if (existing.email === email) {
        return res.json({ success: false, message: 'Email уже зарегистрирован' });
      }
    }

    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, verification_code, verification_code_expires, email_verified) 
       VALUES ($1, $2, $3, $4, $5, false) 
       RETURNING id, username, email, subscription, registered_at, is_admin, is_banned, email_verified, settings`,
      [username, email, Buffer.from(password).toString('base64'), verificationCode, codeExpires]
    );

    const user = mapUserFromDb(result.rows[0]);
    const emailSent = await sendVerificationEmail(email, username, verificationCode);
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Код подтверждения отправлен на email', 
        requiresVerification: true,
        data: user 
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Ошибка отправки кода. Попробуйте позже.'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};
