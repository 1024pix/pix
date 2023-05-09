const TABLE_NAME = 'certification-issue-reports';
const COLUMN_NAME = 'subcategory';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
