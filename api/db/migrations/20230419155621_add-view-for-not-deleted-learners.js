const VIEW_NAME = 'view-active-organization-learners';
const REFERENCE_TABLE_NAME = 'organization-learners';

const up = async function (knex) {
  await knex.schema.createView(VIEW_NAME, function (view) {
    view.as(knex(REFERENCE_TABLE_NAME).whereNull('deletedAt'));
  });
};

const down = function (knex) {
  return knex.schema.dropView(VIEW_NAME);
};

export { down, up };
