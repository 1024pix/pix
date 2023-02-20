const TABLE_NAME = 'schooling-registrations';

export const up = async function (knex) {
  await knex.raw(
    'CREATE INDEX "organizationid_studentnumber_index" ON "schooling-registrations" ("organizationId", "studentNumber");'
  );
  await knex.raw(
    'CREATE UNIQUE INDEX "organizationid_studentnumber_notsupernumerary_index" ON "schooling-registrations" ("organizationId", "studentNumber") WHERE "isSupernumerary" IS FALSE;'
  );
  return knex.schema.table(TABLE_NAME, (table) => table.dropUnique(['studentNumber', 'organizationId']));
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => table.unique(['studentNumber', 'organizationId']));
  await knex.raw(
    'DROP INDEX "organizationid_studentnumber_index" ON "schooling-registrations" ("organizationId", "studentNumber");'
  );
  return knex.raw(
    'DROP UNIQUE INDEX "organizationid_studentnumber_notsupernumerary_index" ON "schooling-registrations" ("organizationId", "studentNumber") WHERE "isSupernumerary" IS FALSE;'
  );
};
