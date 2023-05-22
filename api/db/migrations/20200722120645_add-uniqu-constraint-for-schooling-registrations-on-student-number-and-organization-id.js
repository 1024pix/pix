const TABLE_NAME = 'schooling-registrations';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['studentNumber', 'organizationId']);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['studentNumber', 'organizationId']);
  });
};

export { up, down };
