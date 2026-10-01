const TABLE_NAME = 'competence-scores';

/**
 * A migrated user's displayed score, one row per competence.
 *
 * Today a competence score is the sum of the `earnedPix` frozen on each
 * validated knowledge element. The knowledge state does not keep that figure:
 * it is read against the current referential, so a learning-content change
 * could lower it. The product rule is that a displayed score never goes down,
 * except when the user resets the competence. This table stores that score
 * for migrated users: it is seeded from their knowledge elements when they are
 * migrated and only ever raised afterward, by the application.
 *
 * Non-migrated users have no row here: their score still comes from their
 * knowledge elements.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.integer('userId').references('users.id').notNullable();
    table.string('competenceId').notNullable();
    // Same type as `knowledge-elements.earnedPix`: the score is a floored sum of
    // fractional pix values, and the fractional part must survive between saves.
    table.float('pix').notNullable().defaultTo(0);
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    // The (userId, competenceId) pair is the key the application upserts on.
    table.primary(['userId', 'competenceId']);
    // The schema can only hold the range: 8 levels of 8 pix at most. The
    // "never goes down" rule lives in the upsert.
    table.check('"pix" BETWEEN 0 AND 64', [], 'competence_scores_pix_range');
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
