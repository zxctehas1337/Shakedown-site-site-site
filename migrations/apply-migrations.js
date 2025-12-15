import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import 'dotenv/config';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applyMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Apply all migration files in order
    const migrationFiles = ['001_initial_schema.sql', '002_fix_created_at_column.sql'];
    
    for (const file of migrationFiles) {
      const migrationPath = join(__dirname, file);
      const migrationSQL = await readFile(migrationPath, 'utf-8');
      
      console.log(`Applying migration: ${file}...`);
      await client.query(migrationSQL);
      console.log(`Migration ${file} applied successfully!`);
    }
    
    await client.query('COMMIT');
    console.log('All migrations applied successfully!');
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
