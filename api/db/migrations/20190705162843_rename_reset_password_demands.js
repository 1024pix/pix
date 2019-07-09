const TABLE_NAME = 'reset-password-demands';
const NEW_TABLE_NAME = 'password-reset-demands';

exports.up = function(knex) {
  return knex.schema.renameTable(TABLE_NAME, NEW_TABLE_NAME);
};

exports.down = function(knex) {
  return knex.schema.renameTable(NEW_TABLE_NAME, TABLE_NAME);
};
