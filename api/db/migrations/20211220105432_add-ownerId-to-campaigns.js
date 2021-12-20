const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'ownerId';

exports.up = function (knex) {
  return knex.schema
    .table(TABLE_NAME, function (table) {
      table.bigInteger(COLUMN_NAME).notNullable().defaultTo(123456789);
    })
    .then(() => knex.raw('update "campaigns" set "ownerId" = "creatorId" ;'));
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
