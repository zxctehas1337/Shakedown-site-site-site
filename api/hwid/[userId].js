const { getPool } = require('../_lib/db');

module.exports = async (req, res) => {
  const { userId } = req.query;
  const pool = getPool();

  try {
    const result = await pool.query('SELECT hwid FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Пользователь не найден' });
    }

    res.json({ success: true, hwid: result.rows[0].hwid || null });
  } catch (error) {
    console.error('Get HWID error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};
