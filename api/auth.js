const { getPool } = require('./_lib/db');
const { generateVerificationCode, sendVerificationEmail } = require('./_lib/email');
const { mapUserFromDb } = require('./_lib/userMapper');

module.exports = async (req, res) => {
  const { action } = req.query;
  const pool = getPool();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    switch (action) {
      case 'login':
        return await handleLogin(req, res, pool);
      case 'register':
        return await handleRegister(req, res, pool);
      case 'resend-code':
        return await handleResendCode(req, res, pool);
      case 'verify-code':
        return await handleVerifyCode(req, res, pool);
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

async function handleLogin(req, res, pool) {
  const { usernameOrEmail, password } = req.body;
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
}

async function handleRegister(req, res, pool) {
  const { username, email, password } = req.body;

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
    res.json({ success: false, message: 'Ошибка отправки кода. Попробуйте позже.' });
  }
}

async function handleResendCode(req, res, pool) {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, message: 'Не указан ID пользователя' });
  }

  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

  if (result.rows.length === 0) {
    return res.json({ success: false, message: 'Пользователь не найден' });
  }

  const user = result.rows[0];

  if (user.email_verified) {
    return res.json({ success: false, message: 'Email уже подтвержден' });
  }

  const verificationCode = generateVerificationCode();
  const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

  await pool.query(
    'UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE id = $3',
    [verificationCode, codeExpires, userId]
  );

  const emailSent = await sendVerificationEmail(user.email, user.username, verificationCode);
  
  if (emailSent) {
    res.json({ success: true, message: 'Новый код отправлен на email' });
  } else {
    res.json({ success: false, message: 'Ошибка отправки кода' });
  }
}

async function handleVerifyCode(req, res, pool) {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.json({ success: false, message: 'Не указан ID пользователя или код' });
  }

  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

  if (result.rows.length === 0) {
    return res.json({ success: false, message: 'Пользователь не найден' });
  }

  const user = result.rows[0];

  if (new Date() > new Date(user.verification_code_expires)) {
    return res.json({ success: false, message: 'Код истек. Запросите новый код.' });
  }

  if (user.verification_code !== code) {
    return res.json({ success: false, message: 'Неверный код подтверждения' });
  }

  await pool.query(
    'UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = $1',
    [userId]
  );

  res.json({ success: true, message: 'Email успешно подтвержден!' });
}
