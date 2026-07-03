const QUESTS_TABLE_NAME = 'quests';
const BLUEPRINTS_TABLE_NAME = 'combined_course_blueprints';
const COLUMN_NAME = 'rewardRequirementsDescription';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(BLUEPRINTS_TABLE_NAME, function (table) {
    table.text(COLUMN_NAME).nullable().comment('The description of the necessary requirements to obtain a reward');
  });

  await knex(BLUEPRINTS_TABLE_NAME)
    .update({
      [COLUMN_NAME]: knex.ref(`${QUESTS_TABLE_NAME}.${COLUMN_NAME}`),
    })
    .updateFrom(QUESTS_TABLE_NAME)
    .where(`${QUESTS_TABLE_NAME}.id`, '=', knex.ref(`${BLUEPRINTS_TABLE_NAME}.questId`));

  await knex.schema.table(QUESTS_TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(QUESTS_TABLE_NAME, function (table) {
    table.text(COLUMN_NAME).nullable().comment('The description of the necessary requirements to obtain a reward');
  });

  await knex(QUESTS_TABLE_NAME)
    .update({
      [COLUMN_NAME]: knex.ref(`${BLUEPRINTS_TABLE_NAME}.${COLUMN_NAME}`),
    })
    .updateFrom(BLUEPRINTS_TABLE_NAME)
    .where(`${QUESTS_TABLE_NAME}.id`, '=', knex.ref(`${BLUEPRINTS_TABLE_NAME}.questId`));

  await knex.schema.table(BLUEPRINTS_TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
