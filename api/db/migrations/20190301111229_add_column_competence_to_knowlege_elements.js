const TABLE_NAME = 'knowledge-elements';

exports.up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('competenceId').index();
  });
};

exports.down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('competenceId');
  });
};
