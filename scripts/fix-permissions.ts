const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'testing',
  synchronize: false,
});

async function fixPermissions() {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // First, let's see what we have
    const permissions = await dataSource.query('SELECT * FROM permissions');
    console.log('Current permissions:', permissions);

    // Update any null names
    await dataSource.query(`
      UPDATE permissions 
      SET name = CONCAT(resource, ':', action)
      WHERE name IS NULL
    `);

    // Delete any remaining null names (if any)
    await dataSource.query(`
      DELETE FROM permissions 
      WHERE name IS NULL
    `);

    // Add NOT NULL constraint
    await dataSource.query(`
      ALTER TABLE permissions 
      ALTER COLUMN name SET NOT NULL
    `);

    console.log('Permissions table fixed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

fixPermissions(); 