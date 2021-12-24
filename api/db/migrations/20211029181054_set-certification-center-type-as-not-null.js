exports.up = function (knex) {
  return knex.raw('ALTER TABLE "certification-centers" ALTER COLUMN "type" SET NOT NULL');
};

exports.down = function (knex) {
  return knex.raw('ALTER TABLE "certification-centers" ALTER COLUMN "type" DROP NOT NULL');
};
