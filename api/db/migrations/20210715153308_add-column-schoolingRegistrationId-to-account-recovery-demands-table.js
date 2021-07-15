const TABLE_NAME = 'account-recovery-demands';
const SCHOOLING_REGISTRATION_ID = 'schoolingRegistrationId';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer(SCHOOLING_REGISTRATION_ID).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(SCHOOLING_REGISTRATION_ID);
  });
};
