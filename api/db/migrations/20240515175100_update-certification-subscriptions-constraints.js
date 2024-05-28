const up = async function (knex) {
  await knex.schema.dropView('certification-subscriptions');

  await knex.schema.alterTable('complementary-certification-subscriptions', function (table) {
    table.integer('complementaryCertificationId').nullable().alter({ alterType: false });
    table.text('type').alter({ alterNullable: false, alterType: false });
  });

  return knex.schema.createView('certification-subscriptions', function (view) {
    view.as(knex('complementary-certification-subscriptions'));
  });
};

const down = async function (knex) {
  await knex.schema.dropView('certification-subscriptions');

  await knex.schema.table('complementary-certification-subscriptions', function (table) {
    table.integer('complementaryCertificationId').notNullable().alter({ alterType: false });
    table.text('type').notNull().defaultTo('COMPLEMENTARY').alter({ alterNullable: false, alterType: false });
  });

  return knex.schema.createView('certification-subscriptions', function (view) {
    view.as(knex('complementary-certification-subscriptions'));
  });
};

export { down, up };
