export const up = async function (knex) {
  await knex.schema.table('certification-center-memberships', function (table) {
    table.dropUnique(['userId', 'certificationCenterId']);
  });
  return knex.raw(
    'CREATE UNIQUE INDEX "certification-center-memberships_userid_certificationcenterid_disabledAt_unique" ON "certification-center-memberships" ("userId", "certificationCenterId") WHERE "disabledAt" IS NULL;'
  );
};

export const down = function (knex) {
  return knex.schema.table('certification-center-memberships', function (table) {
    table.dropUnique(null, 'certification-center-memberships_userid_certificationcenterid_disabledAt_unique');
    table.unique(['userId', 'certificationCenterId']);
  });
};
