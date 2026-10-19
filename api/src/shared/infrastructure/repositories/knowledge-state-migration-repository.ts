import { DomainTransaction } from '../../domain/DomainTransaction.js';

const TABLE_NAME = 'knowledge_state_migrations';

/** Whether the knowledge of the user is stored as knowledge states. */
export const isMigrated = async (userId: number): Promise<boolean> => {
  const knexConn = DomainTransaction.getConnection();
  const migration = await knexConn<{ userId: number }>(TABLE_NAME).select('userId').where({ userId }).first();

  return Boolean(migration);
};

/** Among the given users, those whose knowledge is stored as knowledge states. */
export const findMigratedUserIds = async (userIds: number[]): Promise<number[]> => {
  if (userIds.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  return knexConn(TABLE_NAME).whereIn('userId', userIds).pluck<number[]>('userId');
};

export const save = async (userId: number, report: object): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn(TABLE_NAME).insert({ userId, report: JSON.stringify(report) });
};
