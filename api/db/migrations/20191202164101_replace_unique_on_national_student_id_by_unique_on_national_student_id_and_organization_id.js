const TABLE_NAME = 'students';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique('nationalStudentId');
    table.unique(['nationalStudentId', 'organizationId']);

  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.unique('nationalStudentId');
    table.dropUnique(['nationalStudentId', 'organizationId']);
  });
};
