const TABLE_NAME = 'memberships';

const up = async function(knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.unique(['userId', 'organizationId']);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['userId', 'organizationId']);
  });
};

export { up, down };
