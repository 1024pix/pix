const TABLE_NAME = 'students';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('preferredLastName');
    table.string('middleName');
    table.string('thirdName');
    table.string('birthCity');
    table.string('birthCityCode');
    table.string('birthProvinceCode');
    table.string('birthCountryCode');
    table.string('MEFCode');
    table.string('status');
    table.string('nationalStudentId').unique().index();
    table.string('division');
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('preferredLastName');
    table.dropColumn('middleName');
    table.dropColumn('thirdName');
    table.dropColumn('birthCity');
    table.dropColumn('birthCityCode');
    table.dropColumn('birthProvinceCode');
    table.dropColumn('birthCountryCode');
    table.dropColumn('MEFCode');
    table.dropColumn('status');
    table.dropColumn('nationalStudentId');
    table.dropColumn('division');
  });
};
