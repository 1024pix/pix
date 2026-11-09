import { KnowledgeState, type KnowledgeStateType } from '../../../src/shared/domain/models/KnowledgeState.ts';
import { databaseBuffer } from '../database-buffer.ts';

const buildKnowledgeState = ({ updatedAt = new Date('2020-01-01'), ...fields }: KnowledgeStateType) => {
  const knowledgeState = new KnowledgeState({ ...fields, updatedAt });
  const values = {
    user_id: knowledgeState.userId,
    tube_id: knowledgeState.tubeId,
    floor: knowledgeState.floor,
    ceiling: knowledgeState.ceiling,
    ceiling_at: knowledgeState.ceilingAt,
    direct_levels: knowledgeState.directLevels,
    updated_at: knowledgeState.updatedAt,
  };

  return databaseBuffer.pushInsertable({ tableName: 'knowledge_states', values });
};

export { buildKnowledgeState };
