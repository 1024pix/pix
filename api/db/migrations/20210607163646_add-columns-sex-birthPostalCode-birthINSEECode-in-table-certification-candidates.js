export const up = async function (knex) {
  await knex.schema.table('certification-candidates', (table) => {
    table.string('birthPostalCode');
    table.string('birthINSEECode');
    table.string('sex', 1);
  });

  await knex.schema.alterTable('certification-candidates', (table) => {
    table.string('birthCity').nullable().alter();
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('certification-candidates', (table) => {
    table.dropColumns('birthPostalCode', 'birthINSEECode', 'sex');
    table.string('birthCity').notNullable().alter();
  });
};
