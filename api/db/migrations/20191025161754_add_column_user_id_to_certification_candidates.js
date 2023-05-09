const TABLE_NAME = 'certification-candidates';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').index();
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('userId');
  });
};

export { up, down };
