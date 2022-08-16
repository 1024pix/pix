const TABLE_NAME = 'campaign-participations';
const COLUMN = 'isCertifiable';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.boolean(COLUMN).nullable().defaultTo(null);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(COLUMN);
  });
};
