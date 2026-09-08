const TABLE_NAME = 'attestations';
const KEY_COLUMN_NAME = 'key';
const TEMPLATE_NAME_COLUMN_NAME = 'templateName';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(KEY_COLUMN_NAME).notNullable().alter({ alterType: false });
    table.string(TEMPLATE_NAME_COLUMN_NAME).notNullable().alter({ alterType: false });
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(KEY_COLUMN_NAME).nullable().alter({ alterType: false });
    table.string(TEMPLATE_NAME_COLUMN_NAME).nullable().alter({ alterType: false });
  });
}
