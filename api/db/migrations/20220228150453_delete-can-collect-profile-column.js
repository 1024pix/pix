const TABLE_NAME = 'organizations';
const COLUMN = 'canCollectProfiles';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(COLUMN);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, async (table) => {
    table.boolean(COLUMN).notNullable().defaultTo(false);
  });
};
