import { sql } from 'drizzle-orm';
import { db, pool } from './db';

async function main() {
  console.log('Starting database migration...');
  
  try {
    // Check if the datasets table already has the filePath column
    const checkTableResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'datasets' AND column_name = 'file_path'
    `);
    
    if (checkTableResult.rowCount === 0) {
      console.log('Adding filePath and schemaData columns to the datasets table...');
      
      // Add the columns if they don't exist
      await db.execute(sql`
        ALTER TABLE datasets 
        ADD COLUMN IF NOT EXISTS file_path TEXT,
        ADD COLUMN IF NOT EXISTS schema_data TEXT
      `);
      
      console.log('Columns added successfully.');
    } else {
      console.log('Columns already exist, no changes needed.');
    }
    
    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

main();