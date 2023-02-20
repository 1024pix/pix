const TABLE_NAME = 'students';
const USERID_COLUMN = 'userId';
const ORGANIZATIONID_COLUMN = 'organizationId';
const NATIONALSTUDENTID_COLUMN = 'nationalStudentId';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropIndex(NATIONALSTUDENTID_COLUMN);
    table.dropIndex(ORGANIZATIONID_COLUMN);
    table.dropIndex(USERID_COLUMN);
    table.dropUnique([NATIONALSTUDENTID_COLUMN, ORGANIZATIONID_COLUMN]);
    table.unique([ORGANIZATIONID_COLUMN, NATIONALSTUDENTID_COLUMN]);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.index(NATIONALSTUDENTID_COLUMN);
    table.index(ORGANIZATIONID_COLUMN);
    table.index(USERID_COLUMN);
    table.unique([NATIONALSTUDENTID_COLUMN, ORGANIZATIONID_COLUMN]);
    table.dropUnique([ORGANIZATIONID_COLUMN, NATIONALSTUDENTID_COLUMN]);
  });
};
