const TABLE_NAME = 'schooling-registrations';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.string('nationalApprenticeId');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('nationalApprenticeId');
  });
};

export { up, down };
