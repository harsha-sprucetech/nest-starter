import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import bcrypt from 'bcrypt';

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

// Admin user configuration
const ADMIN_USER = {
  email: 'admin@example.com',
  password: '123456',
  name: 'Admin User',
};

// Resources and their actions
const RESOURCES = [
  { name: 'posts', actions: ['create', 'read', 'update', 'delete', 'like', 'unlike'] },
  { name: 'comments', actions: ['create', 'read', 'update', 'delete', 'like', 'unlike'] },
  { name: 'admin/roles', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'admin/permissions', actions: ['create', 'read', 'update', 'delete'] },
  { name: 'admin/database', actions: ['manage'] },
];

async function createTables(client: Client): Promise<void> {
  // Create roles table
  await client.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create permissions table
  await client.query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      resource VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      description TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      "mobileNumber" VARCHAR(255) UNIQUE,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create role_permissions junction table
  await client.query(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );
  `);

  // Create user_roles junction table
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, role_id)
    );
  `);
}

async function createAdminUser(): Promise<void> {
  const client = new Client(DB_CONFIG);

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully');

    // Create tables if they don't exist
    console.log('Creating tables if they don\'t exist...');
    await createTables(client);
    console.log('Tables created successfully');

    // Start a transaction
    await client.query('BEGIN');

    try {
      // Check if admin role already exists
      const existingRole = await client.query(
        'SELECT id FROM roles WHERE name = $1',
        ['admin']
      );

      let adminRoleId: number;
      if (existingRole.rows.length > 0) {
        adminRoleId = existingRole.rows[0].id;
        console.log('Admin role already exists');
      } else {
        // Create admin role
        const roleResult = await client.query(
          'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id',
          ['admin', 'Administrator role with full access']
        );
        adminRoleId = roleResult.rows[0].id;
        console.log('Created admin role');
      }

      // Create permissions
      const permissions = [];
      for (const resource of RESOURCES) {
        for (const action of resource.actions) {
          const permissionName = `${resource.name}_${action}`;
          
          // Check if permission already exists
          const existingPermission = await client.query(
            'SELECT id FROM permissions WHERE name = $1',
            [permissionName]
          );

          if (existingPermission.rows.length > 0) {
            permissions.push(existingPermission.rows[0].id);
            continue;
          }

          const permissionResult = await client.query(
            'INSERT INTO permissions (name, resource, action, description) VALUES ($1, $2, $3, $4) RETURNING id',
            [
              permissionName,
              resource.name,
              action,
              `Permission to ${action} ${resource.name}`,
            ]
          );
          permissions.push(permissionResult.rows[0].id);
        }
      }
      console.log('Created/verified permissions');

      // Create role-permission relationships
      for (const permissionId of permissions) {
        // Check if relationship already exists
        const existingRelationship = await client.query(
          'SELECT 1 FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
          [adminRoleId, permissionId]
        );

        if (existingRelationship.rows.length === 0) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [adminRoleId, permissionId]
          );
        }
      }
      console.log('Assigned permissions to admin role');

      // Check if admin user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [ADMIN_USER.email]
      );

      let adminUserId: number;
      if (existingUser.rows.length > 0) {
        adminUserId = existingUser.rows[0].id;
        console.log('Admin user already exists');
      } else {
        // Create admin user
        const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);
        const userResult = await client.query(
          'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
          [ADMIN_USER.email, hashedPassword, ADMIN_USER.name]
        );
        adminUserId = userResult.rows[0].id;
        console.log('Created admin user');
      }

      // Check if user-role relationship already exists
      const existingUserRole = await client.query(
        'SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = $2',
        [adminUserId, adminRoleId]
      );

      if (existingUserRole.rows.length === 0) {
        await client.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [adminUserId, adminRoleId]
        );
        console.log('Created user-role relationship');
      } else {
        console.log('User-role relationship already exists');
      }

      // Commit the transaction
      await client.query('COMMIT');

      console.log('\nAdmin setup completed successfully!');
      console.log('Email:', ADMIN_USER.email);
      console.log('Password:', ADMIN_USER.password);

      process.exit(0);
    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the script
createAdminUser(); 