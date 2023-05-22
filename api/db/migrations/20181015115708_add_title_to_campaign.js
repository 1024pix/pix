const TABLE_NAME = 'campaigns';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('title');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('title');
  });
};

export { up, down };
