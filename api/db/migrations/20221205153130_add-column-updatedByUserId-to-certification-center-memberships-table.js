const TABLE_NAME = 'certification-center-memberships';
const COLUMN_NAME = 'updatedByUserId';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.bigInteger(COLUMN_NAME).index().references('users.id');
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
