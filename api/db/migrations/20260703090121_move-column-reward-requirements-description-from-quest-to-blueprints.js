const BLUEPRINTS_TABLE_NAME = 'combined_course_blueprints';
const QUESTS_TABLE_NAME = 'quests';
const COLUMN_NAME = 'rewardRequirementsDescription';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(BLUEPRINTS_TABLE_NAME, function (table) {
    table.text(COLUMN_NAME).nullable().comment('The description of the necessary requirements to obtain a reward');
  });

  await knex.schema.table(QUESTS_TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(BLUEPRINTS_TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });

  await knex.schema.table(QUESTS_TABLE_NAME, function (table) {
    table.text(COLUMN_NAME).nullable().comment('The description of the necessary requirements to obtain a reward');
  });
};

export { down, up };
