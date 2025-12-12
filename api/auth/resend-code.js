const { getPool } = require('../_lib/db');
const { generateVerificationCode, sendVerificationEmail } = require('../_lib/email');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId } = req.body;
  const pool = getPool();

  if (!userId) {
    return res.json({ success: false, message: 'Не указан ID пользователя' });
  }

  try {
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
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};
