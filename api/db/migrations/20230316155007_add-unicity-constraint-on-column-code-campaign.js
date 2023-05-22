const TABLE_NAME = 'campaigns';

const up = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, function (t) {
    t.unique('code');
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique('code');
  });
};

export { up, down };
