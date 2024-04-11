const up = async function (knex) {
  await knex.schema.createTable('certification-center-features', (table) => {
    table.increments('id').primary();
    table.integer('certificationCenterId').unsigned();
    table.foreign('certificationCenterId').references('id').inTable('certification-centers');
    table.integer('featureId').unsigned();
    table.foreign('featureId').references('id').inTable('features');
  });

  return knex('features').insert([
    {
      key: 'CAN_REGISTER_FOR_A_SINGLE_COMPLEMENTARY_ALONE',
      description:
        "Permet l'accès pour un centre de certification à l'inscription d'un candidat passant une complémentaire seule.",
    },
  ]);
};

const down = async function (knex) {
  await knex.schema.dropTable('certification-center-features');
  return knex('features').where({ key: 'CAN_REGISTER_FOR_A_SINGLE_COMPLEMENTARY_ALONE' }).delete();
};

export { down, up };
