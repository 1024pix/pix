const OLD_TABLE_NAME = 'badge-partner-competences';
const NEW_TABLE_NAME = 'skill-sets';

const OLD_COLUMN_NAME = 'partnerCompetenceIds';
const NEW_COLUMN_NAME = 'skillSetIds';

export const up = async function (knex) {
  await knex.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);
  return knex.schema.table('badge-criteria', (t) => t.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME));
};

export const down = async function (knex) {
  await knex.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);
  return knex.schema.table('badge-criteria', (t) => t.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME));
};
