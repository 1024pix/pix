const TABLE_NAME = 'students';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique('nationalStudentId');
    table.unique(['nationalStudentId', 'organizationId']);
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique('nationalStudentId');
    table.dropUnique(['nationalStudentId', 'organizationId']);
  });
};

export { up, down };
