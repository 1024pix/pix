const TABLE_NAME = 'campaign-participations';
const COLUMN_NAME = 'pixScore';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME).defaultTo(null);
  });
};

const down = function(knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
