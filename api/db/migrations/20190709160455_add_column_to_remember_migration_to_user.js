const TABLE_NAME = 'users';
const COLUMN_NAME_PROFILEV2 = 'isProfileV2';
const COLUMN_NAME_PROFILEV2_DATE = 'migratedAt';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME_PROFILEV2).notNullable().defaultTo(false);
    table.dateTime(COLUMN_NAME_PROFILEV2_DATE).nullable();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME_PROFILEV2);
    table.dropColumn(COLUMN_NAME_PROFILEV2_DATE);
  });
};
