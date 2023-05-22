const TABLE_NAME = 'campaigns';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('idPixLabel');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('idPixLabel');
  });
};

export { up, down };
