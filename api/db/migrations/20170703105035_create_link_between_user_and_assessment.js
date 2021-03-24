const TABLE_NAME = 'assessments';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.bigInteger('userId').index().references('users.id');
    table.dropColumn('userName');
    table.dropColumn('userEmail');
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('userId');
    table.string('userName').notNull();
    table.string('userEmail').notNull();
  });
};
