const TABLE_NAME = 'campaigns';
const COLUMN_NAME = 'type';

const up = function(knex) {
  return knex.schema
    .table(TABLE_NAME, function (table) {
      table.string(COLUMN_NAME).notNullable().defaultTo('');
    })
    .then(() => {
      return knex(TABLE_NAME).update({
        type: 'TEST_GIVEN',
      });
    });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
