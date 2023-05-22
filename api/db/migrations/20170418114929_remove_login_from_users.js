const TABLE_NAME = 'users';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('login');
    table.boolean('cgu');
    table.unique('email');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string('login').defaultTo('').notNullable();
    table.dropColumn('cgu');
  });
};

export { up, down };
