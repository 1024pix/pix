const TABLE_NAME = 'target-profiles';
const COLUMN = 'migration_status';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN).default('N/A').notNullable();
  });
  await knex(TABLE_NAME)
    .update(COLUMN, 'NOT_MIGRATED')
    .whereNotIn('id', function () {
      this.select('targetProfileId').from('target-profile_tubes');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN);
  });
};
