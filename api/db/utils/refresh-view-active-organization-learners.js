const VIEW_NAME = 'view-active-organization-learners';
const REFERENCE_TABLE_NAME = 'organization-learners';

const refreshViewActiveOrganizationLearners = async (knex) => {
  await knex.schema.createViewOrReplace(VIEW_NAME, function (view) {
    view.as(knex(REFERENCE_TABLE_NAME).whereNull('deletedAt'));
  });
};

export { refreshViewActiveOrganizationLearners };
