const TABLE_NAME = 'competence-evaluations';

export const up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('status');
  });
};

export const down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('status');
  });
};
