import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigrations() {
  const pool = new Pool({
    connectionString: 'postgresql://nihmadev:PdRLZGRdUGylo6Q8qCW1B1sbaoXNwqmh@dpg-d4bp826uk2gs73de38qg-a.oregon-postgres.render.com/looser',
    ssl: {
      rejectUnauthorized: false
    }
  });
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Read the migration file
    const migrationPath = join(__dirname, '001_initial_schema.sql');
    const migrationSQL = await readFile(migrationPath, 'utf-8');
    
    console.log('Applying migration...');
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    console.log('Migration applied successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
applyMigrations().catch(console.error);
