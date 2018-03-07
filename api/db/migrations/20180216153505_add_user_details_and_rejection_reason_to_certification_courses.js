const TABLE_NAME = 'certification-courses';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.string('firstName');
    table.string('lastName');
    table.date('birthdate');
    table.string('birthplace');
    table.string('rejectionReason');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, function(table) {
    table.dropTable('firstName');
    table.dropTable('lastName');
    table.dropTable('birthdate');
    table.dropTable('birthplace');
    table.dropTable('rejectionReason');
  });
};
