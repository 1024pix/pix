const OLD_TABLE_NAME = 'schooling-registrations';
const NEW_TABLE_NAME = 'organization-learners';

exports.up = async function (knex) {
  await knex.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);
};

exports.down = async function (knex) {
  await knex.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);
};
