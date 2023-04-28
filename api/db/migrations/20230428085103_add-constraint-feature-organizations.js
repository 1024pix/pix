const TABLE_NAME = 'organization-features';
const CONSTRAINT_NAME = 'organizationId_featureId_unique';

exports.up = async (knex) => {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.unique(['organizationId', 'featureId'], CONSTRAINT_NAME);
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['organizationId', 'featureId'], CONSTRAINT_NAME);
  });
};
