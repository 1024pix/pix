const TABLE_NAME = 'organizations-accesses';

exports.up = (knex) => {
  return knex.schema.renameTable(TABLE_NAME, 'memberships');
};

exports.down = (knex) => {
  return knex.schema.renameTable('memberships', TABLE_NAME);
};
