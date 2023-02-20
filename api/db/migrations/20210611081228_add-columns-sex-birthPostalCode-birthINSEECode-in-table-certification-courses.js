export const up = async function (knex) {
  await knex.schema.table('certification-courses', (table) => {
    table.string('birthPostalCode');
    table.string('birthINSEECode');
    table.string('sex', 1);
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('certification-courses', (table) => {
    table.dropColumns('birthPostalCode', 'birthINSEECode', 'sex');
  });
};
