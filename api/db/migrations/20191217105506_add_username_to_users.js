const TABLE_NAME = 'users';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('username').unique();
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('username');
  });
};

export { up, down };
