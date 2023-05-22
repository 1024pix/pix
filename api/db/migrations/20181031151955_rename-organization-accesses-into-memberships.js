const TABLE_NAME = 'organizations-accesses';

const up = function (knex) {
  return knex.schema.renameTable(TABLE_NAME, 'memberships');
};

const down = function (knex) {
  return knex.schema.renameTable('memberships', TABLE_NAME);
};

export { up, down };
