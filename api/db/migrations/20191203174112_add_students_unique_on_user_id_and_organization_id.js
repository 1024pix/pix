const TABLE_NAME = 'students';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['userId', 'organizationId']);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['userId', 'organizationId']);
  });
};

export { up, down };
