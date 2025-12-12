const { getPool } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, hwid } = req.body;
  const pool = getPool();

  if (!userId || !hwid) {
    return res.json({ success: false, message: 'Не указан userId или hwid' });
  }

  try {
    const result = await pool.query(
      'SELECT hwid, subscription, is_banned FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    const user = result.rows[0];

    if (user.is_banned) {
      return res.json({ success: false, message: 'Аккаунт заблокирован' });
    }

    if (!user.hwid) {
      await pool.query('UPDATE users SET hwid = $1 WHERE id = $2', [hwid, userId]);
      return res.json({ success: true, message: 'HWID привязан', subscription: user.subscription });
    }

    if (user.hwid !== hwid) {
      return res.json({ success: false, message: 'HWID не совпадает. Требуется сброс привязки.' });
    }

    res.json({ success: true, message: 'HWID подтвержден', subscription: user.subscription });
  } catch (error) {
    console.error('Verify HWID error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};
