/**
 * The tables of the knowledge states project were created with camelCase
 * columns, like the historical schema. New tables and columns are snake_case:
 * these four tables are renamed before any user is migrated in production, so
 * the rename is a metadata change on empty or small tables.
 */
const RENAMES = {
  knowledge_states: {
    userId: 'user_id',
    tubeId: 'tube_id',
    ceilingAt: 'ceiling_at',
    directLevels: 'direct_levels',
    updatedAt: 'updated_at',
  },
  user_competence_scores: {
    userId: 'user_id',
    competenceId: 'competence_id',
    updatedAt: 'updated_at',
  },
  knowledge_state_migrations: {
    userId: 'user_id',
    migratedAt: 'migrated_at',
  },
  migrated_user_knowledge_elements: {
    createdAt: 'created_at',
    answerId: 'answer_id',
    assessmentId: 'assessment_id',
    skillId: 'skill_id',
    earnedPix: 'earned_pix',
    userId: 'user_id',
    competenceId: 'competence_id',
    savedAt: 'saved_at',
  },
};

/**
 * @param { import("knex").Knex } knex
 * @param { (renames: [string, string][]) => [string, string][] } direction
 * @returns { Promise<void> }
 */
const renameColumns = async (knex, direction) => {
  for (const [tableName, renames] of Object.entries(RENAMES)) {
    await knex.schema.alterTable(tableName, (table) => {
      for (const [from, to] of direction(Object.entries(renames))) {
        table.renameColumn(from, to);
      }
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async (knex) => {
  await renameColumns(knex, (renames) => renames);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async (knex) => {
  await renameColumns(knex, (renames) => renames.map(([from, to]) => [to, from]));
};

export { down, up };
