const TABLE_NAME = 'users';
const PIX_ORGA_TERMS_OF_SERVICE_ACCEPTED_COLUMN_NAME = 'pixOrgaTermsOfServiceAccepted';
const LAST_PIX_ORGA_TERMS_OF_SERVICE_ACCEPTED_COLUMN_NAME = 'lastPixOrgaTermsOfServiceValidatedAt';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(PIX_ORGA_TERMS_OF_SERVICE_ACCEPTED_COLUMN_NAME);
    table.dropColumn(LAST_PIX_ORGA_TERMS_OF_SERVICE_ACCEPTED_COLUMN_NAME);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(PIX_ORGA_TERMS_OF_SERVICE_ACCEPTED_COLUMN_NAME);
    table.dateTime(LAST_PIX_ORGA_TERMS_OF_SERVICE_ACCEPTED_COLUMN_NAME);
  });
};

export { down, up };
