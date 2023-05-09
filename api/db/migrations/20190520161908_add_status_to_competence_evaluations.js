const TABLE_NAME = 'competence-evaluations';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('status');
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('status');
  });
};

export { up, down };
