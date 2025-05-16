import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameToUsers1710595300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, add the column as nullable to avoid conflicts with existing data
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "name" varchar
        `);

        // Update any existing records to have a default name
        await queryRunner.query(`
            UPDATE "users" 
            SET "name" = 'User ' || id 
            WHERE "name" IS NULL
        `);

        // Make the column not nullable after setting default values
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "name" SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "name"
        `);
    }
} 