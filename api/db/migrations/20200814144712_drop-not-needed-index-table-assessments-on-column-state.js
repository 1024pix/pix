const TABLE_NAME = 'assessments';
const TYPE_COLUMN = 'state';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(TYPE_COLUMN);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(TYPE_COLUMN);
  });
};

export { up, down };
