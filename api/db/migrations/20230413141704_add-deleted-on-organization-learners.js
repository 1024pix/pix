const TABLE_NAME = 'organization-learners';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dateTime('deletedAt').nullable();
    table.bigInteger('deletedBy').index().references('users.id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('deletedAt');
    table.dropColumn('deletedBy');
  });
};
