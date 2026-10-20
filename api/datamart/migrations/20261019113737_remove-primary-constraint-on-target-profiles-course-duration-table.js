const TABLE_NAME = 'target_profiles_course_duration';
const INDEX_NAME = 'target_profiles_course_duration_target_profile_id_idx';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.dropPrimary();
  });

  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('targetProfileId').nullable().alter();
    table.index(['targetProfileId'], INDEX_NAME);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.dropIndex(['targetProfileId'], INDEX_NAME);
  });

  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.integer('targetProfileId').notNullable().alter();
    table.primary(['targetProfileId']);
  });
};

export { down, up };
