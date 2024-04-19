const VIEW_NAME = 'certification-subscriptions';
const REFERENCE_TABLE_NAME = 'complementary-certification-subscriptions';

const up = async function (knex) {
  await knex.schema.createView(VIEW_NAME, function (view) {
    view.as(knex(REFERENCE_TABLE_NAME));
  });
};

const down = function (knex) {
  return knex.schema.dropView(VIEW_NAME);
};

export { down, up };
