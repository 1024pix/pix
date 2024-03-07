const TABLE_NAME = 'organization-features';
const CONSTRAINT_NAME = 'organizationId_featureId_unique';

const up = async function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.unique(['organizationId', 'featureId'], CONSTRAINT_NAME);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['organizationId', 'featureId'], CONSTRAINT_NAME);
  });
};

export { down, up };
