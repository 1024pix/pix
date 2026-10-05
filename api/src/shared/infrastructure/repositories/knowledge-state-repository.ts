import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeState, type KnowledgeStateType } from '../../domain/models/KnowledgeState.ts';

const TABLE_NAME = 'knowledge_states';

export const findByUserIds = async ({ userIds }: { userIds: number[] }): Promise<KnowledgeState[]> => {
  if (userIds.length === 0) return [];

  const rows = await DomainTransaction.getConnection()<KnowledgeStateType>(TABLE_NAME).whereIn('userId', userIds);

  return rows.map((row) => new KnowledgeState(row));
};

export const save = async ({ knowledgeStates }: { knowledgeStates: KnowledgeState[] }): Promise<void> => {
  if (knowledgeStates.length === 0) return;

  await DomainTransaction.getConnection()(TABLE_NAME)
    .insert(knowledgeStates.map((knowledgeState) => ({ ...knowledgeState })))
    .onConflict(['userId', 'tubeId'])
    .merge(['floor', 'ceiling', 'ceilingAt', 'directLevels', 'updatedAt']);
};

export const remove = async ({ userId, tubeIds }: { userId: number; tubeIds: string[] }): Promise<void> => {
  if (tubeIds.length === 0) return;

  await DomainTransaction.getConnection()(TABLE_NAME).where({ userId }).whereIn('tubeId', tubeIds).delete();
};
