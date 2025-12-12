const { getPool } = require('../_lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId } = req.body;
  const pool = getPool();

  if (!userId) {
    return res.json({ success: false, message: 'Не указан userId' });
  }

  try {
    await pool.query('UPDATE users SET hwid = NULL WHERE id = $1', [userId]);
    res.json({ success: true, message: 'HWID успешно сброшен' });
  } catch (error) {
    console.error('Reset HWID error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};
