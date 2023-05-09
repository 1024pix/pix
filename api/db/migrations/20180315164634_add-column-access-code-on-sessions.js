const TABLE_NAME = 'sessions';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string('accessCode');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('accessCode');
  });
};

export { up, down };
