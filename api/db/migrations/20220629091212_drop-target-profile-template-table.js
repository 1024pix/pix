const TEMPLATE_TABLE_NAME = 'target-profile-templates';
const OLD_TEMPLATE_TUBES_TABLE_NAME = 'target-profile-templates_tubes';
const TARGET_PROFILE_TUBES_TABLE_NAME = 'target-profile_tubes';
const TARGET_PROFILE_TABLE_NAME = 'target-profiles';

const up = async function (knex) {
  await knex.schema.renameTable(OLD_TEMPLATE_TUBES_TABLE_NAME, TARGET_PROFILE_TUBES_TABLE_NAME);

  await knex.schema.table(TARGET_PROFILE_TUBES_TABLE_NAME, (t) => {
    t.integer('targetProfileId').references('target-profiles.id');
  });

  await knex(TARGET_PROFILE_TUBES_TABLE_NAME).update({
    targetProfileId: knex(TARGET_PROFILE_TABLE_NAME)
      .select('target-profiles.id')
      .where('target-profiles.targetProfileTemplateId', knex.ref('target-profile_tubes.targetProfileTemplateId')),
  });

  await knex.schema.table(TARGET_PROFILE_TUBES_TABLE_NAME, (t) => {
    t.dropNullable('targetProfileId');
    t.dropColumn('targetProfileTemplateId');
  });

  await knex.schema.table(TARGET_PROFILE_TABLE_NAME, (t) => {
    t.dropColumn('targetProfileTemplateId');
  });

  await knex.schema.dropTable(TEMPLATE_TABLE_NAME);
};

const down = async function (knex) {
  await knex.schema.createTable(TEMPLATE_TABLE_NAME, (t) => {
    t.increments().primary();
  });

  await knex.schema.table(TARGET_PROFILE_TABLE_NAME, (t) => {
    t.integer('targetProfileTemplateId').references('target-profile-templates.id');
  });

  await knex.schema.table(TARGET_PROFILE_TUBES_TABLE_NAME, (t) => {
    t.integer('targetProfileTemplateId').references('target-profile-templates.id');
  });

  const results = await knex(TARGET_PROFILE_TUBES_TABLE_NAME).distinct('targetProfileId');

  for (const targetProfiles of results) {
    const { targetProfileId } = targetProfiles;
    const [{ id: targetProfileTemplateId }] = await knex(TEMPLATE_TABLE_NAME).insert({}).returning('id');

    await knex(TARGET_PROFILE_TABLE_NAME).update({ targetProfileTemplateId }).where({ id: targetProfileId });
    await knex(TARGET_PROFILE_TUBES_TABLE_NAME).update({ targetProfileTemplateId }).where({ targetProfileId });
  }

  await knex.schema.table(TARGET_PROFILE_TUBES_TABLE_NAME, (t) => {
    t.dropNullable('targetProfileTemplateId');
    t.dropColumn('targetProfileId');
  });

  await knex.schema.renameTable(TARGET_PROFILE_TUBES_TABLE_NAME, OLD_TEMPLATE_TUBES_TABLE_NAME);
};

export { down, up };
