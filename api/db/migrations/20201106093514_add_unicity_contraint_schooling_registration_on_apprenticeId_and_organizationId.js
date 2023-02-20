const TABLE_NAME = 'schooling-registrations';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['organizationId', 'nationalApprenticeId']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['organizationId', 'nationalApprenticeId']);
  });
};
