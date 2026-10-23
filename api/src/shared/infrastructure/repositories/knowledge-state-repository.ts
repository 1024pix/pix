import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeState, type KnowledgeStateType } from '../../domain/models/KnowledgeState.ts';

const TABLE_NAME = 'knowledge_states';

export const findByUserId = async (userId: number): Promise<KnowledgeState[]> => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<KnowledgeStateType>(TABLE_NAME).where({ userId });

  return rows.map((row) => new KnowledgeState(row));
};

export const findByUserIds = async (userIds: number[]): Promise<KnowledgeState[]> => {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<KnowledgeStateType>(TABLE_NAME).whereIn('userId', userIds);

  return rows.map((row) => new KnowledgeState(row));
};

export const upsert = async (knowledgeStates: KnowledgeState[]): Promise<void> => {
  if (knowledgeStates.length === 0) return;

  const knexConn = DomainTransaction.getConnection();
  await knexConn(TABLE_NAME)
    .insert(knowledgeStates.map((knowledgeState) => ({ ...knowledgeState })))
    .onConflict(['userId', 'tubeId'])
    .merge(['floor', 'ceiling', 'ceilingAt', 'directLevels', 'updatedAt']);
};

export const remove = async (userId: number, tubeIds: string[]): Promise<void> => {
  if (tubeIds.length === 0) return;

  const knexConn = DomainTransaction.getConnection();
  await knexConn(TABLE_NAME).where({ userId }).whereIn('tubeId', tubeIds).delete();
};
