import { databaseBuffer } from '../database-buffer.js';

/**
 * The marker of a user whose knowledge is stored as knowledge states.
 */
const buildKnowledgeStateMigration = ({ userId, migratedAt = new Date('2020-01-01'), report = null }) => {
  const values = { userId, migratedAt, report };

  return databaseBuffer.pushInsertable({ tableName: 'knowledge_state_migrations', values });
};

export { buildKnowledgeStateMigration };
