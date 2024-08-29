const VIEW_NAME = 'view-active-organization-learners';
const REFERENCE_TABLE_NAME = 'organization-learners';

const up = async function (knex) {
  await knex.schema.createViewOrReplace(VIEW_NAME, function (view) {
    view.as(knex(REFERENCE_TABLE_NAME).whereNull('deletedAt').whereNull('deletedBy'));
  });
};

const down = async function (knex) {
  await knex.schema.createViewOrReplace(VIEW_NAME, function (view) {
    view.as(knex(REFERENCE_TABLE_NAME).whereNull('deletedAt'));
  });
};

export { down, up };
