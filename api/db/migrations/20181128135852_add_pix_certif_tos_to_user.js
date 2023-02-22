const TABLE_NAME = 'users';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('pixCertifTermsOfServiceAccepted').defaultTo(false);
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('pixCertifTermsOfServiceAccepted');
  });
};
