const TABLE_NAME = 'students';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['userId', 'organizationId']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['userId', 'organizationId']);
  });
};
