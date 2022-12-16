const TABLE_NAME = 'certification-candidates';
const RESULT_RECIPIENT_EMAIL = 'resultRecipientEmail';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(RESULT_RECIPIENT_EMAIL, 500);
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(RESULT_RECIPIENT_EMAIL);
  });
};
