const OLD_TABLE_NAME = 'certification-partner-acquisitions';
const TABLE_NAME = 'partner-certifications';

exports.up = async function(knex) {
  return knex.schema.renameTable(OLD_TABLE_NAME, TABLE_NAME);
};

exports.down = async function(knex) {
  return knex.schema.renameTable(TABLE_NAME, OLD_TABLE_NAME);
};
