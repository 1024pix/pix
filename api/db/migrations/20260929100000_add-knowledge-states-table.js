const TABLE_NAME = 'knowledge-states';

/**
 * A user's knowledge state, one row per tube.
 *
 * This table coexists with `knowledge-elements` for as long as users are
 * migrated progressively. It is its compressed form: since inference only
 * propagates within the tube (downwards when the answer is right, upwards when
 * it is wrong), two bounds are enough to describe the whole set of validated
 * and invalidated skills.
 *
 * `directLevels` keeps the levels actually asked, as opposed to the ones that
 * were only inferred: the selection algorithm estimates the user's level from
 * direct answers only.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').notNullable();
    table.string('tubeId').notNullable();
    table.smallint('floor').notNullable().defaultTo(0);
    table.smallint('ceiling').nullable();
    table.specificType('directLevels', 'smallint[]').notNullable().defaultTo('{}');
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    // No technical column: the (userId, tubeId) pair is the key, and it is
    // what the application upserts on. A serial would serve no purpose and
    // its counter would be consumed by every upsert, even on update.
    table.primary(['userId', 'tubeId']);
    // A level goes from 0 (nothing validated) to 8, the highest skill level.
    table.check('"floor" BETWEEN 0 AND 8', [], 'knowledge_states_floor_level');
    table.check('"ceiling" BETWEEN 0 AND 8', [], 'knowledge_states_ceiling_level');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async (knex) => {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
