const TABLE_NAME = 'knowledge-elements';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').index();
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('userId');
  });
};
