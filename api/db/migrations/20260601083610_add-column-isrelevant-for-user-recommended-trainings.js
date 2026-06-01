const TABLE_NAME = 'user-recommended-trainings';
const COLUMN_NAME = 'isRelevant';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table
      .boolean(COLUMN_NAME)
      .defaultTo(null)
      .comment('To report if trainings recommendation is relevant according to the user');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
