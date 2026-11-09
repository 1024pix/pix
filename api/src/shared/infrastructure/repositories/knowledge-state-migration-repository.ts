import { DomainTransaction } from '../../domain/DomainTransaction.js';

const TABLE_NAME = 'knowledge_state_migrations';

type Row = {
  user_id: number;
  migrated_at: Date;
  report: object | null;
};

/** Whether the knowledge of the user is stored as knowledge states. */
export const isMigrated = async (userId: number): Promise<boolean> => {
  const knexConn = DomainTransaction.getConnection();
  const migration = await knexConn<Row>(TABLE_NAME).select('user_id').where({ user_id: userId }).first();

  return Boolean(migration);
};

/** Among the given users, those whose knowledge is stored as knowledge states. */
export const findMigratedUserIds = async (userIds: number[]): Promise<number[]> => {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  return knexConn<Row>(TABLE_NAME).whereIn('user_id', userIds).pluck<number[]>('user_id');
};

export const save = async (userId: number, report: object): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn(TABLE_NAME).insert({ user_id: userId, report: JSON.stringify(report) });
};
