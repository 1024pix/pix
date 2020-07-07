const TABLE_NAME = 'schooling-registrations';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('email');
    table.string('studentNumber');
    table.string('department');
    table.string('educationalTeam');
    table.string('group');
    table.string('diploma');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('email');
    table.dropColumn('studentNumber');
    table.dropColumn('department');
    table.dropColumn('educationalTeam');
    table.dropColumn('group');
    table.dropColumn('diploma');
  });
};
