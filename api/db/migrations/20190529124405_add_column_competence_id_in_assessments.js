const TABLE_NAME = 'assessments';

export const up = async function (knex) {
  const info = await knex(TABLE_NAME).columnInfo();
  if (!info.competenceId) {
    await knex.schema.table(TABLE_NAME, (t) => t.string('competenceId').index());
    await knex.raw(`
      UPDATE assessments
      SET "competenceId" = (SELECT "competenceId" FROM "competence-evaluations" WHERE "competence-evaluations"."assessmentId" = assessments.id)
      WHERE type = 'COMPETENCE_EVALUATION'
    `);
  }
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (t) => {
    t.dropColumn('competenceId');
  });
};
