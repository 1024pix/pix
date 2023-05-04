const up = function(knex) {
  return knex.raw('ALTER TABLE "certification-centers" ALTER COLUMN "type" SET NOT NULL');
};

const down = function(knex) {
  return knex.raw('ALTER TABLE "certification-centers" ALTER COLUMN "type" DROP NOT NULL');
};

export { up, down };
