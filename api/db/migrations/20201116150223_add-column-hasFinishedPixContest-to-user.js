const TABLE_NAME = 'users';
const NEW_COLUMN = 'finishedPixContestAt';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dateTime(NEW_COLUMN).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(NEW_COLUMN);
  });
};
