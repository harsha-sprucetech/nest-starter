import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCommentsTable1710000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS "comments" CASCADE`);

    // Create comments table with correct schema and foreign key constraints
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "authorId" INTEGER NOT NULL,
        "postId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_comments_author" FOREIGN KEY ("authorId") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_post" FOREIGN KEY ("postId") 
          REFERENCES "posts"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "comments" CASCADE`);
  }
} 