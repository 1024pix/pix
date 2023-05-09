const TABLE_NAME = 'organizations';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.text('logoUrl');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.drop('logoUrl');
  });
};

export { up, down };
