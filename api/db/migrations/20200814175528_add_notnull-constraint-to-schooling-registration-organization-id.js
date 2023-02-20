export const up = function (knex) {
  return knex.raw('ALTER TABLE "schooling-registrations" ALTER COLUMN "organizationId" SET NOT NULL;');
};

export const down = function (knex) {
  return knex.raw('ALTER TABLE "schooling-registrations" ALTER COLUMN "organizationId" DROP NOT NULL;');
};
