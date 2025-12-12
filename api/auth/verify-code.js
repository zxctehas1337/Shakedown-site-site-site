const { getPool } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, code } = req.body;
  const pool = getPool();

  if (!userId || !code) {
    return res.json({ success: false, message: 'Не указан ID пользователя или код' });
  }

  try {
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
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};
