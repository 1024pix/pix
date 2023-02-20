const TABLE_NAME = 'users';
const HAS_BEEN_ANONYMISED_COLUMN_NAME = 'hasBeenAnonymised';
const HAS_BEEN_ANONYMISED_BY_COLUMN_NAME = 'hasBeenAnonymisedBy';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.boolean(HAS_BEEN_ANONYMISED_COLUMN_NAME).defaultTo(false);
    table.integer(HAS_BEEN_ANONYMISED_BY_COLUMN_NAME).defaultTo(null);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(HAS_BEEN_ANONYMISED_COLUMN_NAME);
    table.dropColumn(HAS_BEEN_ANONYMISED_BY_COLUMN_NAME);
  });
};
