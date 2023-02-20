export const up = async function (knex) {
  await knex.raw('ALTER TABLE "competence-marks" ALTER COLUMN "competenceId" SET NOT NULL');
  await knex.raw('ALTER TABLE "competence-marks" ALTER COLUMN "assessmentResultId" SET NOT NULL');
  await knex.raw('ALTER TABLE "competence-marks" ALTER COLUMN "level" SET NOT NULL');
  await knex.raw('ALTER TABLE "competence-marks" ALTER COLUMN "score" SET NOT NULL');
};

export const down = async function (knex) {
  await knex.raw('ALTER TABLE "competence-marks" ALTER COLUMN "competenceId" DROP NOT NULL');
  await knex.raw('ALTER TABLE "competence-marks" ALTER COLUMN "assessmentResultId" DROP NOT NULL');
  await knex.raw('ALTER TABLE "competence-marks" ALTER COLUMN "level" DROP NOT NULL');
  await knex.raw('ALTER TABLE "competence-marks" ALTER COLUMN "score" DROP NOT NULL');
};
