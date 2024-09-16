import type { Knex } from 'knex';

const TABLE_NAME = 'audit-log';
const COLUMN_NAME = 'data';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.jsonb(COLUMN_NAME).defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
}
