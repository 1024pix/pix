const up = function(knex) {
  return knex.schema.table('assessments', (table) => {
    table.string('lastChallengeId', 50);
  });
};

const down = function(knex) {
  return knex.schema.table('assessments', function (table) {
    table.dropColumn('lastChallengeId');
  });
};

export { up, down };
