const TABLE_NAME = 'certification-courses';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.integer('userId').references('users.id').index();
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('userId');
  });
};

export { up, down };
