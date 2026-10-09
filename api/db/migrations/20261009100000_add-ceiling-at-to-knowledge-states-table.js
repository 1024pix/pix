const TABLE_NAME = 'knowledge_states';
const CHECK_NAME = 'knowledge_states_ceiling_at_with_ceiling';

/**
 * The date of the latest failure of a tube.
 *
 * A knowledge state keeps one date per tube, its last move, which every
 * success refreshes. Improving a competence or a campaign assesses again the
 * failures old enough, and needs the date of the failures themselves: a
 * success on the tube since then must not make an old failure look recent.
 * The column is null exactly when the tube has no ceiling.
 *
 * A ceiling already stored has no date of its own: it takes the last move of
 * its tube, the only date known, which counts it as recent.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async (knex) => {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dateTime('ceilingAt').nullable();
  });
  await knex(TABLE_NAME)
    .whereNotNull('ceiling')
    .update({ ceilingAt: knex.ref('updatedAt') });
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.check('("ceiling" IS NULL) = ("ceilingAt" IS NULL)', [], CHECK_NAME);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async (knex) => {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropChecks([CHECK_NAME]);
    table.dropColumn('ceilingAt');
  });
};

export { down, up };
