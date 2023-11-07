const TABLE_NAME = 'mission-assessments';

const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.integer('organizationLearnerId').notNullable().references('organization-learners.id');
  });
};

const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn('organizationLearnerId');
  });
};

export { up, down };
