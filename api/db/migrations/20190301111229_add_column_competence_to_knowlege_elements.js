const TABLE_NAME = 'knowledge-elements';

export const up = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('competenceId').index();
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('competenceId');
  });
};
