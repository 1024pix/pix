const TABLE_NAME = 'target-profiles';
const COMMENT = 'comment';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.text(COMMENT);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COMMENT);
  });
};
