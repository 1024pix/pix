const TABLE_NAME = 'organization-learner-features';
const CONSTRAINT_NAME = 'organizationLearnerId_featureId_unique';

const up = async function (knex) {
  return knex.schema.createTable(TABLE_NAME, function (table) {
    table.bigIncrements().primary();
    table.bigInteger('featureId').references('features.id').notNullable().comment('Feature identifier');
    table
      .bigInteger('organizationLearnerId')
      .references('organization-learners.id')
      .notNullable()
      .comment('Identifier of the organization learner having the feature');
    table.unique(['featureId', 'organizationLearnerId'], CONSTRAINT_NAME);
    table.comment('Association table between organization-learners and features.');
  });
};

const down = async function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
