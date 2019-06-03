const TABLE_NAME = 'assessments';

exports.up = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => {
    t.string('competenceId').index();
  });
};

exports.down = function(knex) {
  return knex.schema.table(TABLE_NAME, (t) => {
    t.dropColumn('competenceId');
  });
};
