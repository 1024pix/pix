const TEMPLATE_TABLE_NAME = 'target-profile-templates';
const TEMPLATE_TUBES_TABLE_NAME = 'target-profile-templates_tubes';
const TARGET_PROFILE_TABLE_NAME = 'target-profiles';

export const up = async function (knex) {
  await knex.schema.createTable(TEMPLATE_TABLE_NAME, (t) => {
    t.increments().primary();
  });

  await knex.schema.createTable(TEMPLATE_TUBES_TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('targetProfileTemplateId').notNullable().references('target-profile-templates.id');
    t.string('tubeId').notNullable();
    t.integer('level').notNullable();
  });

  await knex.schema.table(TARGET_PROFILE_TABLE_NAME, (t) => {
    t.integer('targetProfileTemplateId').references('target-profile-templates.id');
  });
};

export const down = async function (knex) {
  await knex.schema.table(TARGET_PROFILE_TABLE_NAME, (t) => {
    t.dropColumn('targetProfileTemplateId');
  });
  await knex.schema.dropTable(TEMPLATE_TUBES_TABLE_NAME);
  await knex.schema.dropTable(TEMPLATE_TABLE_NAME);
};
