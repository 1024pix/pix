const VIEW_NAME = 'view-active-organization-learners';
const REFERENCE_TABLE_NAME = 'organization-learners';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createView(VIEW_NAME, function (view) {
    view.as(knex(REFERENCE_TABLE_NAME).whereNull('deletedAt'));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropView(VIEW_NAME);
};
