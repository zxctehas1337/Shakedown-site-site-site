import { getPool } from './_lib/db.js';

export default async function handler(req, res) {
  const pool = getPool();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetVersions(req, res, pool);
        break;
      case 'POST':
        await handleCreateVersion(req, res, pool);
        break;
      case 'PATCH':
        await handleUpdateVersion(req, res, pool);
        break;
      case 'DELETE':
        await handleDeleteVersion(req, res, pool);
        break;
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Versions API error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
}

async function handleGetVersions(_req, res, pool) {
  const result = await pool.query(
    `SELECT id, version, download_url, description, is_active, created_at
     FROM client_versions
     ORDER BY created_at DESC, id DESC`
  );

  const versions = result.rows.map(v => ({
    id: v.id,
    version: v.version,
    downloadUrl: v.download_url,
    description: v.description,
    isActive: v.is_active,
    createdAt: v.created_at
  }));

  res.json({ success: true, data: versions });
}

async function handleCreateVersion(req, res, pool) {
  const { version, downloadUrl, description, isActive } = req.body || {};

  if (!version || !downloadUrl) {
    res.status(400).json({ success: false, message: 'version и downloadUrl обязательны' });
    return;
  }

  if (isActive) {
    await pool.query('UPDATE client_versions SET is_active = false WHERE is_active = true');
  }

  const result = await pool.query(
    `INSERT INTO client_versions (version, download_url, description, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING id, version, download_url, description, is_active, created_at`,
    [String(version).trim(), String(downloadUrl).trim(), description ?? null, Boolean(isActive)]
  );

  const v = result.rows[0];

  res.json({
    success: true,
    data: {
      id: v.id,
      version: v.version,
      downloadUrl: v.download_url,
      description: v.description,
      isActive: v.is_active,
      createdAt: v.created_at
    }
  });
}

async function handleUpdateVersion(req, res, pool) {
  const { id } = req.query;
  const { version, downloadUrl, description, isActive } = req.body || {};

  if (!id) {
    res.status(400).json({ success: false, message: 'ID версии обязателен' });
    return;
  }

  const fields = [];
  const values = [];
  let paramCount = 1;

  if (version !== undefined) {
    fields.push(`version = $${paramCount}`);
    values.push(String(version).trim());
    paramCount++;
  }

  if (downloadUrl !== undefined) {
    fields.push(`download_url = $${paramCount}`);
    values.push(String(downloadUrl).trim());
    paramCount++;
  }

  if (description !== undefined) {
    fields.push(`description = $${paramCount}`);
    values.push(description ?? null);
    paramCount++;
  }

  if (isActive !== undefined) {
    fields.push(`is_active = $${paramCount}`);
    values.push(Boolean(isActive));
    paramCount++;
  }

  if (fields.length === 0) {
    res.status(400).json({ success: false, message: 'Нет полей для обновления' });
    return;
  }

  if (isActive) {
    await pool.query('UPDATE client_versions SET is_active = false WHERE is_active = true');
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE client_versions SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, version, download_url, description, is_active, created_at`,
    values
  );

  if (result.rows.length === 0) {
    res.json({ success: false, message: 'Версия не найдена' });
    return;
  }

  const v = result.rows[0];

  res.json({
    success: true,
    data: {
      id: v.id,
      version: v.version,
      downloadUrl: v.download_url,
      description: v.description,
      isActive: v.is_active,
      createdAt: v.created_at
    }
  });
}

async function handleDeleteVersion(req, res, pool) {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ success: false, message: 'ID версии обязателен' });
    return;
  }

  const result = await pool.query('DELETE FROM client_versions WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    res.json({ success: false, message: 'Версия не найдена' });
    return;
  }

  res.json({ success: true, message: 'Версия удалена' });
}
