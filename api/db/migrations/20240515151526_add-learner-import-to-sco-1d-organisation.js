const up = async function (knex) {
  const [feature] = await knex.select('id').from('features').where({ key: 'LEARNER_IMPORT' }).limit(1);
  const organizationIdsSco1d = await knex.select('id').from('organizations').where({ type: 'SCO-1D' });
  const [organizationLearnerImportFormat] = await knex
    .select('id')
    .from('organization-learner-import-formats')
    .where({ name: 'ONDE' })
    .limit(1);

  for await (const organization of organizationIdsSco1d) {
    await knex('organization-features')
      .insert({
        organizationId: organization.id,
        featureId: feature.id,
        params: { organizationLearnerImportFormatId: organizationLearnerImportFormat.id },
      })
      .onConflict()
      .ignore();
  }
};

const down = async function (knex) {
  const [feature] = await knex.select('id').from('features').where({ key: 'LEARNER_IMPORT' }).limit(1);
  const organizationIdsSco1d = await knex.select('id').from('organizations').where({ type: 'SCO-1D' });

  for await (const organization of organizationIdsSco1d) {
    await knex('organization-features').del().where({
      organizationId: organization.id,
      featureId: feature.id,
    });
  }
};

export { down, up };
