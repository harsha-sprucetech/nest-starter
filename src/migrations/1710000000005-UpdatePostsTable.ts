import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePostsTable1710000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS "posts" CASCADE`);

    // Create posts table with correct schema
    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(255) NOT NULL,
        "body" TEXT NOT NULL,
        "authorId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "posts" CASCADE`);
  }
} 