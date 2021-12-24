exports.up = function (knex) {
  return knex.schema.table('assessments', (table) => {
    table.string('lastChallengeId', 50);
  });
};

exports.down = function (knex) {
  return knex.schema.table('assessments', function (table) {
    table.dropColumn('lastChallengeId');
  });
};
