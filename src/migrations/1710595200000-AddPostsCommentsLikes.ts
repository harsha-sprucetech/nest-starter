import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostsCommentsLikes1710595200000 implements MigrationInterface {
  name = 'AddPostsCommentsLikes1710595200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" SERIAL NOT NULL,
        "title" text NOT NULL,
        "body" text NOT NULL,
        "published" boolean NOT NULL DEFAULT false,
        "authorId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_posts" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" SERIAL NOT NULL,
        "content" text NOT NULL,
        "postId" integer NOT NULL,
        "authorId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_comments" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "likes" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "postId" integer,
        "commentId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_likes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_post_user_like" UNIQUE ("userId", "postId"),
        CONSTRAINT "UQ_comment_user_like" UNIQUE ("userId", "commentId")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "posts"
      ADD CONSTRAINT "FK_posts_users"
      FOREIGN KEY ("authorId")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_posts"
      FOREIGN KEY ("postId")
      REFERENCES "posts"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_users"
      FOREIGN KEY ("authorId")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "likes"
      ADD CONSTRAINT "FK_likes_users"
      FOREIGN KEY ("userId")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "likes"
      ADD CONSTRAINT "FK_likes_posts"
      FOREIGN KEY ("postId")
      REFERENCES "posts"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "likes"
      ADD CONSTRAINT "FK_likes_comments"
      FOREIGN KEY ("commentId")
      REFERENCES "comments"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_likes_comments"`);
    await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_likes_posts"`);
    await queryRunner.query(`ALTER TABLE "likes" DROP CONSTRAINT "FK_likes_users"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_users"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_posts"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_users"`);
    await queryRunner.query(`DROP TABLE "likes"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "posts"`);
  }
} 