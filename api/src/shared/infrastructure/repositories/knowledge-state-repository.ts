import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { KnowledgeState } from '../../domain/models/KnowledgeState.ts';

const TABLE_NAME = 'knowledge_states';

type Row = {
  user_id: number;
  tube_id: string;
  floor: number;
  ceiling: number | null;
  ceiling_at: Date | null;
  direct_levels: number[];
  updated_at: Date;
};

const toRow = (knowledgeState: KnowledgeState): Row => ({
  user_id: knowledgeState.userId,
  tube_id: knowledgeState.tubeId,
  floor: knowledgeState.floor,
  ceiling: knowledgeState.ceiling,
  ceiling_at: knowledgeState.ceilingAt,
  direct_levels: knowledgeState.directLevels,
  updated_at: knowledgeState.updatedAt,
});

const toDomain = (row: Row): KnowledgeState =>
  new KnowledgeState({
    userId: row.user_id,
    tubeId: row.tube_id,
    floor: row.floor,
    ceiling: row.ceiling,
    ceilingAt: row.ceiling_at,
    directLevels: row.direct_levels,
    updatedAt: row.updated_at,
  });

// Two saves of the same user at once would read the same knowledge states
// and scores, and the last one would overwrite the first: they take turns.
// A migration of the user takes the same turn, so that a save never reads
// a migration status that the migration is about to change.
export const lockUser = async (userId: number): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn.raw("SELECT pg_advisory_xact_lock(hashtext('knowledge_states'), ?)", [userId]);
};

export const findByUserId = async (userId: number): Promise<KnowledgeState[]> => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<Row>(TABLE_NAME).where({ user_id: userId });

  return rows.map(toDomain);
};

export const findByUserIds = async (userIds: number[]): Promise<KnowledgeState[]> => {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<Row>(TABLE_NAME).whereIn('user_id', userIds);

  return rows.map(toDomain);
};

export const upsert = async (knowledgeStates: KnowledgeState[]): Promise<void> => {
  if (knowledgeStates.length === 0) return;

  const knexConn = DomainTransaction.getConnection();
  await knexConn<Row>(TABLE_NAME)
    .insert(knowledgeStates.map(toRow))
    .onConflict(['user_id', 'tube_id'])
    .merge(['floor', 'ceiling', 'ceiling_at', 'direct_levels', 'updated_at']);
};

export const remove = async (userId: number, tubeIds: string[]): Promise<void> => {
  if (tubeIds.length === 0) return;

  const knexConn = DomainTransaction.getConnection();
  await knexConn<Row>(TABLE_NAME).where({ user_id: userId }).whereIn('tube_id', tubeIds).delete();
};
