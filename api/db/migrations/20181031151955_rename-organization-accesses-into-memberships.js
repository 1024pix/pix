const TABLE_NAME = 'organizations-accesses';

export const up = (knex) => {
  return knex.schema.renameTable(TABLE_NAME, 'memberships');
};

export const down = (knex) => {
  return knex.schema.renameTable('memberships', TABLE_NAME);
};
