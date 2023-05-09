const TABLE_NAME = 'schooling-registrations';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['organizationId', 'nationalApprenticeId']);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['organizationId', 'nationalApprenticeId']);
  });
};

export { up, down };
