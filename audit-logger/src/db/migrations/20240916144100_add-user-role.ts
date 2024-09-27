import type { Knex } from 'knex';

const TABLE_NAME = 'audit-log';
const CONSTRAINT_NAME = 'audit-log_role_check';
const COLUMN_NAME = 'role';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
  await knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "${COLUMN_NAME}" IN ('SUPER_ADMIN', 'SUPPORT', 'USER') )`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
  await knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "${COLUMN_NAME}" IN ('SUPER_ADMIN', 'SUPPORT') )`,
  );
}
