const TABLE_NAME = 'knowledge-state-migrations';

/**
 * The marker of a user's migration to knowledge states.
 *
 * A row means the user is migrated: their knowledge is read from and written
 * to `knowledge-states`, and their displayed score comes from
 * `competence-scores`. A user without a row is served from their knowledge
 * elements, exactly as today. There is no way back for a migrated user, so a
 * row is never deleted, except when the user themselves is deleted.
 *
 * `report` keeps what the migration job observed about the user: the checks
 * it ran and the score the knowledge state would compute next to the score
 * that was copied. It is informative only.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').primary();
    table.dateTime('migratedAt').notNullable().defaultTo(knex.fn.now());
    table.jsonb('report').nullable();
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
