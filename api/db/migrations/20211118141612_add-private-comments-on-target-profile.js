const TABLE_NAME = 'target-profiles';
const COMMENT = 'comment';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.text(COMMENT);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COMMENT);
  });
};
