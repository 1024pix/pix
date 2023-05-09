const OLD_TABLE_NAME = 'certification-partner-acquisitions';
const TABLE_NAME = 'partner-certifications';

const up = async function(knex) {
  return knex.schema.renameTable(OLD_TABLE_NAME, TABLE_NAME);
};

const down = async function(knex) {
  return knex.schema.renameTable(TABLE_NAME, OLD_TABLE_NAME);
};

export { up, down };
