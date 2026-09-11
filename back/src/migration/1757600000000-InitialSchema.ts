import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class InitialSchema1757600000000 implements MigrationInterface {
  name = 'InitialSchema1757600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'USER')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'INACTIVE')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."patient_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'INACTIVE')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."professional_type_enum" AS ENUM('DENTIST', 'ASSISTANT')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."professional_status_enum" AS ENUM('ACTIVE', 'INACTIVE')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."appointment_status_enum" AS ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."participation_type_enum" AS ENUM('RESPONSIBLE', 'ASSISTANT')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'password_hash', type: 'varchar', length: '255' },
          {
            name: 'role',
            type: 'user_role_enum',
            default: "'USER'",
          },
          {
            name: 'status',
            type: 'user_status_enum',
            default: "'ACTIVE'",
          },
          {
            name: 'must_change_password',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'patients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'phone', type: 'varchar', length: '20' },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'birth_date', type: 'date', isNullable: true },
          {
            name: 'cpf',
            type: 'varchar',
            length: '14',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'status',
            type: 'patient_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'patients',
      new TableIndex({
        name: 'IDX_patients_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'patients',
      new TableIndex({
        name: 'IDX_patients_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'professionals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'phone', type: 'varchar', length: '20' },
          { name: 'type', type: 'professional_type_enum' },
          {
            name: 'status',
            type: 'professional_status_enum',
            default: "'ACTIVE'",
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'professionals',
      new TableIndex({
        name: 'IDX_professionals_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'patient_id', type: 'uuid' },
          { name: 'start_at', type: 'timestamptz' },
          { name: 'end_at', type: 'timestamptz' },
          { name: 'duration_minutes', type: 'int' },
          {
            name: 'status',
            type: 'appointment_status_enum',
            default: "'SCHEDULED'",
          },
          { name: 'notes', type: 'text', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({
        name: 'FK_appointments_patient',
        columnNames: ['patient_id'],
        referencedTableName: 'patients',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'IDX_appointments_patient_id',
        columnNames: ['patient_id'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'IDX_appointments_start_at',
        columnNames: ['start_at'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'IDX_appointments_end_at',
        columnNames: ['end_at'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'IDX_appointments_start_end',
        columnNames: ['start_at', 'end_at'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'appointment_participants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'appointment_id', type: 'uuid' },
          { name: 'professional_id', type: 'uuid' },
          { name: 'participation_type', type: 'participation_type_enum' },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_appointment_participants_appointment_professional',
            columnNames: ['appointment_id', 'professional_id'],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'appointment_participants',
      new TableForeignKey({
        name: 'FK_appointment_participants_appointment',
        columnNames: ['appointment_id'],
        referencedTableName: 'appointments',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'appointment_participants',
      new TableForeignKey({
        name: 'FK_appointment_participants_professional',
        columnNames: ['professional_id'],
        referencedTableName: 'professionals',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createIndex(
      'appointment_participants',
      new TableIndex({
        name: 'IDX_appointment_participants_appointment_id',
        columnNames: ['appointment_id'],
      }),
    );

    await queryRunner.createIndex(
      'appointment_participants',
      new TableIndex({
        name: 'IDX_appointment_participants_professional_id',
        columnNames: ['professional_id'],
      }),
    );

    await queryRunner.createIndex(
      'appointment_participants',
      new TableIndex({
        name: 'IDX_appointment_participants_professional_appointment',
        columnNames: ['professional_id', 'appointment_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('appointment_participants', true);
    await queryRunner.dropTable('appointments', true);
    await queryRunner.dropTable('professionals', true);
    await queryRunner.dropTable('patients', true);
    await queryRunner.dropTable('users', true);

    await queryRunner.query(
      'DROP TYPE IF EXISTS "public"."participation_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS "public"."appointment_status_enum"',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS "public"."professional_status_enum"',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS "public"."professional_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS "public"."patient_status_enum"',
    );
    await queryRunner.query('DROP TYPE IF EXISTS "public"."user_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."user_role_enum"');
  }
}
