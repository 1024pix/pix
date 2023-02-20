export const up = function (knex) {
  return knex.raw('ALTER TABLE "certification-centers" ALTER COLUMN "type" SET NOT NULL');
};

export const down = function (knex) {
  return knex.raw('ALTER TABLE "certification-centers" ALTER COLUMN "type" DROP NOT NULL');
};
