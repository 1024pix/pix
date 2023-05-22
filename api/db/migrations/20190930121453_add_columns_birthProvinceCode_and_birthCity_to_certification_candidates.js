const TABLE_NAME = 'certification-candidates';
const BIRTH_PROVINCE_CODE_COLUMN_NAME = 'birthProvinceCode';
const BIRTH_COUNTRY_COLUMN_NAME = 'birthCountry';

const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string(BIRTH_PROVINCE_CODE_COLUMN_NAME);
    table.string(BIRTH_COUNTRY_COLUMN_NAME);
  });
};

const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(BIRTH_PROVINCE_CODE_COLUMN_NAME);
    table.dropColumn(BIRTH_COUNTRY_COLUMN_NAME);
  });
};

export { up, down };
