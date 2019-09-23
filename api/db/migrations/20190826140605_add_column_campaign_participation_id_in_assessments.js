const TABLE_NAME = 'assessments';

exports.up = async function(knex) {

  const info = await knex(TABLE_NAME).columnInfo();
  if (!info.campaignParticipationId) {
    await knex.schema.table(TABLE_NAME, (t) => t.integer('campaignParticipationId').unsigned().references('campaign-participations.id').index());
    await knex.raw(`
      UPDATE assessments
      SET "campaignParticipationId" = (SELECT id FROM "campaign-participations" WHERE "campaign-participations"."assessmentId" = assessments.id)
      WHERE type = 'SMART_PLACEMENT'
    `);
  }
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => {
    t.dropColumn('campaignParticipationId');
  });
};
