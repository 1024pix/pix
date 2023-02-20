const TABLE_NAME = 'memberships';

export const up = async (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.unique(['userId', 'organizationId']);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['userId', 'organizationId']);
  });
};
