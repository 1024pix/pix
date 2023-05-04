const up = async function(knex) {
  await knex.raw('ALTER TABLE "knowledge-elements" DROP COLUMN "intId"');
};

const down = async function(knex) {
  await knex.raw('ALTER TABLE "knowledge-elements" ADD COLUMN "intId" INTEGER');
};

export { up, down };
