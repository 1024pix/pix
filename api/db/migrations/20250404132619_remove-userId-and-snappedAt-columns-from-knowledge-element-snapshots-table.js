const TABLE_NAME = 'knowledge-element-snapshots';
const COLUMN_NAMES = ['userId', 'snappedAt'];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    COLUMN_NAMES.forEach((columnName) => {
      table.dropColumn(columnName);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer(COLUMN_NAMES[0]);
    table.dateTime(COLUMN_NAMES[1]);
  });
};

export { down, up };
