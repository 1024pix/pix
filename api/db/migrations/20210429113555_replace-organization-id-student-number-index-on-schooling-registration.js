const TABLE_NAME = 'schooling-registrations';

exports.up = async function(knex) {
  // cspell:disable-next
  await knex.raw('DROP INDEX "organizationid_studentnumber_index"');
  // cspell:disable-next
  await knex.raw('DROP INDEX "organizationid_studentnumber_notsupernumerary_index"');

  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['studentNumber', 'organizationId']);
  });
};

exports.down = async function(knex) {
  // cspell:disable-next
  await knex.raw('CREATE INDEX "organizationid_studentnumber_index" ON "schooling-registrations" ("organizationId", "studentNumber");');
  // cspell:disable-next
  await knex.raw('CREATE UNIQUE INDEX "organizationid_studentnumber_notsupernumerary_index" ON "schooling-registrations" ("organizationId", "studentNumber") WHERE "isSupernumerary" IS FALSE;');

  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['studentNumber', 'organizationId']);
  });
};
