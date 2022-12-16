const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'ownerId';

exports.up = function (knex) {
  return knex.schema
    .table(TABLE_NAME, function (table) {
      table.bigInteger(COLUMN_NAME).references('users.id');
    })
    .then(() => {
      return knex(TABLE_NAME).update({ ownerId: knex.ref('creatorId') });
    })
    .then(() => {
      return knex.schema.alterTable(TABLE_NAME, function (table) {
        table.bigInteger(COLUMN_NAME).notNullable().alter();
      });
    });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
