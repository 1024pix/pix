export const up = async function (knex) {
  await knex.raw('ALTER TABLE "knowledge-elements" DROP COLUMN "intId"');
};

export const down = async function (knex) {
  await knex.raw('ALTER TABLE "knowledge-elements" ADD COLUMN "intId" INTEGER');
};
