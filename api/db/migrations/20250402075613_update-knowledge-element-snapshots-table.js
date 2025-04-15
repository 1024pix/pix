const TABLE_NAME = 'knowledge-element-snapshots';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('userId').nullable().alter();
    table.dateTime('snappedAt').nullable().alter();
    table.dropUnique(['userId', 'snappedAt']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('userId').notNullable().alter();
    table.dateTime('snappedAt').notNullable().alter();
    table.unique(['userId', 'snappedAt']);
  });
};

export { down, up };
