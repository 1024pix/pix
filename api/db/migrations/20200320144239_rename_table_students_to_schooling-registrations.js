const OLD_TABLE_NAME = 'students';
const NEW_TABLE_NAME = 'schooling-registrations';

exports.up = (knex) => {
  return knex.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME);
};

exports.down = (knex) => {
  return knex.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME);
};
