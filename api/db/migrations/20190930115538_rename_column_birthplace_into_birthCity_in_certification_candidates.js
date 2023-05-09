const TABLE_NAME = 'certification-candidates';
const OLD_COLUMN_NAME = 'birthplace';
const NEW_COLUMN_NAME = 'birthCity';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME));
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (t) => t.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME));
};

export { up, down };
