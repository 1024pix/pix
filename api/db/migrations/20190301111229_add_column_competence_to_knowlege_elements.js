const TABLE_NAME = 'knowledge-elements';

const up = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('competenceId').index();
  });
};

const down = function(knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('competenceId');
  });
};

export { up, down };
