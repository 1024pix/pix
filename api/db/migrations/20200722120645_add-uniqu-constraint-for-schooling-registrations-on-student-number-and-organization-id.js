const TABLE_NAME = 'schooling-registrations';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['studentNumber', 'organizationId']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['studentNumber', 'organizationId']);
  });
};
