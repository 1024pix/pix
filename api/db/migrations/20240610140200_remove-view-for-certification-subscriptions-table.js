const up = async function (knex) {
  await knex.schema.dropView('certification-subscriptions');
  return knex.schema.renameTable('complementary-certification-subscriptions', 'certification-subscriptions');
};

const down = async function (knex) {
  await knex.schema.renameTable('certification-subscriptions', 'complementary-certification-subscriptions');
  return knex.schema.createView('certification-subscriptions', function (view) {
    view.as(knex('complementary-certification-subscriptions'));
  });
};

export { down, up };
