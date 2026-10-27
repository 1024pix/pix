import { KnowledgeState, type KnowledgeStateType } from '../../../src/shared/domain/models/KnowledgeState.ts';
import { databaseBuffer } from '../database-buffer.ts';

const buildKnowledgeState = ({ updatedAt = new Date('2020-01-01'), ...fields }: KnowledgeStateType) => {
  const values = new KnowledgeState({ ...fields, updatedAt });

  return databaseBuffer.pushInsertable({ tableName: 'knowledge_states', values });
};

export { buildKnowledgeState };
