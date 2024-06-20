import type { Knex } from 'knex';

const TABLE_NAME = 'audit-log';
const CONSTRAINT_NAME = 'audit-log_action_check';
const COLUMN_NAME = 'action';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
  await knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "${COLUMN_NAME}" IN ('ANONYMIZATION', 'ANONYMIZATION_GAR') )`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "${TABLE_NAME}" DROP CONSTRAINT "${CONSTRAINT_NAME}"`);
  await knex.raw(
    `ALTER TABLE "${TABLE_NAME}" ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK ( "${COLUMN_NAME}" = 'ANONYMIZATION' )`,
  );
}
