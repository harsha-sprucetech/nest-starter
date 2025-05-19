import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private connection: Connection) {}

  async truncateAllTables(): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    
    try {
      // Disable foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Get all table names
      const tables = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = '${this.connection.options.database}'
        AND table_type = 'BASE TABLE'
      `);
      
      // Truncate each table
      for (const table of tables) {
        await queryRunner.query(`TRUNCATE TABLE ${table.table_name}`);
      }
      
      // Re-enable foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      await queryRunner.release();
    }
  }

  async resetSequences(): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();
    
    try {
      // Get all sequences
      const sequences = await queryRunner.query(`
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = '${this.connection.options.database}'
      `);
      
      // Reset each sequence
      for (const sequence of sequences) {
        await queryRunner.query(`ALTER SEQUENCE ${sequence.sequence_name} RESTART WITH 1`);
      }
    } finally {
      await queryRunner.release();
    }
  }

  async resetDatabase(): Promise<void> {
    await this.truncateAllTables();
    await this.resetSequences();
  }
} 