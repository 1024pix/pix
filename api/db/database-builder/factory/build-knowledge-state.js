import { KnowledgeState } from '../../../src/shared/domain/models/KnowledgeState.ts';
import { databaseBuffer } from '../database-buffer.js';

/**
 * A user's knowledge state on one tube.
 */
const buildKnowledgeState = ({ updatedAt = new Date('2020-01-01'), ...fields }) => {
  const values = new KnowledgeState({ ...fields, updatedAt });

  return databaseBuffer.pushInsertable({ tableName: 'knowledge-states', values });
};

export { buildKnowledgeState };
