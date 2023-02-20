const TABLE_NAME = 'campaign-participations';

export const up = async function (knex) {
  const info = await knex(TABLE_NAME).columnInfo();
  if (info.assessmentId) {
    await knex.schema.alterTable(TABLE_NAME, (table) => {
      table.dropColumn('assessmentId');
    });
  }
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, (t) => t.integer('assessmentId').unsigned().references('assessments.id').index());
  await knex.raw(`
      UPDATE "campaign-participations"
      SET "assessmentId" = (SELECT id FROM "assessments" WHERE "campaign-participations".id = assessments."campaignParticipationId" ORDER BY "assessments"."createdAt" desc limit 1)
    `);
};
