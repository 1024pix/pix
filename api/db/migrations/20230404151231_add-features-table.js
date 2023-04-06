const TABLE_NAME_FEATURES = 'features';
const TABLE_NAME_ORGANIZATION_FEATURES = 'organization-features';

exports.up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME_FEATURES, (t) => {
    t.bigIncrements().primary();
    t.string('key').notNullable().unique();
    t.string('description').nullable();
  });

  return knex.schema.createTable(TABLE_NAME_ORGANIZATION_FEATURES, (t) => {
    t.bigIncrements().primary();
    t.bigInteger('featureId').references('features.id').notNullable();
    t.bigInteger('organizationId').references('organizations.id').notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable(TABLE_NAME_FEATURES);

  return knex.schema.dropTable(TABLE_NAME_ORGANIZATION_FEATURES);
};
