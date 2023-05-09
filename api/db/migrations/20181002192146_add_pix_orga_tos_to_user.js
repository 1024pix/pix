const TABLE_NAME = 'users';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean('pixOrgaTermsOfServiceAccepted').defaultTo(false);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('pixOrgaTermsOfServiceAccepted');
  });
};

export { up, down };
