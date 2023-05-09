const TABLE_NAME = 'target-profiles';
const COMMENT = 'comment';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.text(COMMENT);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COMMENT);
  });
};

export { up, down };
