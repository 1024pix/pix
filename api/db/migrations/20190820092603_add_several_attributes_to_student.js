const TABLE_NAME = 'students';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('preferredName');
    table.string('middleName');
    table.string('thirdName');
    table.string('birthCity');
    table.string('birthCityCode');
    table.string('birthProvinceCode');
    table.string('birthCountryCode');
    table.string('MEFCode');
    table.string('status');
    table.string('nationalId');
    table.string('nationalStudentId').unique().index();
    table.string('schoolClass');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('preferredName');
    table.dropColumn('middleName');
    table.dropColumn('thirdName');
    table.dropColumn('birthCity');
    table.dropColumn('birthCityCode');
    table.dropColumn('birthProvinceCode');
    table.dropColumn('birthCountryCode');
    table.dropColumn('MEFCode');
    table.dropColumn('status');
    table.dropColumn('nationalId');
    table.dropColumn('nationalStudentId');
    table.dropColumn('schoolClass');
  });
};
