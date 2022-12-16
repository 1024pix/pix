const TABLE_NAME = 'users';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('pixCertifTermsOfServiceAccepted').defaultTo(false);
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('pixCertifTermsOfServiceAccepted');
  });
};
