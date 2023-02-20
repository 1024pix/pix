const TABLE_NAME = 'students';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique('nationalStudentId');
    table.unique(['nationalStudentId', 'organizationId']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique('nationalStudentId');
    table.dropUnique(['nationalStudentId', 'organizationId']);
  });
};
