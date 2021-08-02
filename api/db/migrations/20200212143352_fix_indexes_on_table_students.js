const TABLE_NAME = 'students';
const USER_ID_COLUMN = 'userId';
const ORGANIZATION_ID_COLUMN = 'organizationId';
const NATIONAL_STUDENT_ID_COLUMN = 'nationalStudentId';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropIndex(NATIONAL_STUDENT_ID_COLUMN);
    table.dropIndex(ORGANIZATION_ID_COLUMN);
    table.dropIndex(USER_ID_COLUMN);
    table.dropUnique([NATIONAL_STUDENT_ID_COLUMN, ORGANIZATION_ID_COLUMN]);
    table.unique([ORGANIZATION_ID_COLUMN, NATIONAL_STUDENT_ID_COLUMN]);
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.index(NATIONAL_STUDENT_ID_COLUMN);
    table.index(ORGANIZATION_ID_COLUMN);
    table.index(USER_ID_COLUMN);
    table.unique([NATIONAL_STUDENT_ID_COLUMN, ORGANIZATION_ID_COLUMN]);
    table.dropUnique([ORGANIZATION_ID_COLUMN, NATIONAL_STUDENT_ID_COLUMN]);
  });
};
