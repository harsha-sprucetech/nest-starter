import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);

const DB_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'starter',
};

async function truncateDatabase(): Promise<void> {
  const client = new Client(DB_CONFIG);

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully');

    // Get all table names
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    const tables = result.rows.map((row: { table_name: string }) => row.table_name);
    console.log('\nFound tables:', tables);

    // Disable triggers temporarily
    await client.query('SET session_replication_role = replica');

    // Truncate all tables
    for (const table of tables) {
      console.log(`Truncating table: ${table}`);
      await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
    }

    // Re-enable triggers
    await client.query('SET session_replication_role = DEFAULT');

    console.log('\nAll tables have been truncated successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the script
truncateDatabase(); 