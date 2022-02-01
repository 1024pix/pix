const TABLE_NAME = 'competence-evaluations';

exports.up = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.string('status');
  });
};

exports.down = (knex) => {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropColumn('status');
  });
};
