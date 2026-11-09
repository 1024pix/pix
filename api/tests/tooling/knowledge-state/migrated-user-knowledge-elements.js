import { knex } from '../databases.js';

const TABLE_NAME = 'migrated_user_knowledge_elements';

const COLUMN_OF = {
  createdAt: 'created_at',
  answerId: 'answer_id',
  assessmentId: 'assessment_id',
  skillId: 'skill_id',
  earnedPix: 'earned_pix',
  userId: 'user_id',
  competenceId: 'competence_id',
  savedAt: 'saved_at',
};
const FIELD_OF = Object.fromEntries(Object.entries(COLUMN_OF).map(([field, column]) => [column, field]));

const renameKeys = (names) => (object) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [names[key] ?? key, value]));

/** The row of the table for a knowledge element given with camelCase fields. */
export const toMigratedUserKnowledgeElementRow = renameKeys(COLUMN_OF);

/** The knowledge element with camelCase fields for a row of the table. */
export const fromMigratedUserKnowledgeElementRow = renameKeys(FIELD_OF);

/** Inserts knowledge elements given with camelCase fields, ids included, in the table. */
export const insertMigratedUserKnowledgeElements = (knowledgeElements) =>
  knex(TABLE_NAME).insert(knowledgeElements.map(toMigratedUserKnowledgeElementRow));
