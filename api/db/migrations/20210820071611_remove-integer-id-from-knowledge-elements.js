exports.up = async function (knex) {
  await knex.raw('ALTER TABLE "knowledge-elements" DROP COLUMN "intId"');
};

exports.down = async function (knex) {
  await knex.raw('ALTER TABLE "knowledge-elements" ADD COLUMN "intId" INTEGER');
};
