const up = function(knex) {
  return knex.schema.table('assessments', (table) => {
    table.string('lastQuestionState', 50).default('asked');
  });
};

const down = function(knex) {
  return knex.schema.table('assessments', function (table) {
    table.dropColumn('lastQuestionState');
  });
};

export { up, down };
