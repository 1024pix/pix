const TABLE_NAME = 'organization-learner-features';
const CONSTRAINT_NAME = 'organizationLearnerId_featureId_unique';

const up = async function (knex) {
  return knex.schema.createTable(TABLE_NAME, function (table) {
    table.bigIncrements().primary();
    table.bigInteger('featureId').references('features.id').notNullable();
    table.bigInteger('organizationLearnerId').references('organization-learners.id').notNullable();
    table.unique(['featureId', 'organizationLearnerId'], CONSTRAINT_NAME);
  });
};

const down = async function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
