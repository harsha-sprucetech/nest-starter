export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: process.env.POSTGRES_DB ?? 'testing',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'your-secret-key-change-it',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  nodeEnv: process.env.NODE_ENV ?? 'development',
}); 