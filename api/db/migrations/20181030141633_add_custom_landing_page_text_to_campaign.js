const TABLE_NAME = 'campaigns';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text('customLandingPageText');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('customLandingPageText');
  });
};

export { up, down };
