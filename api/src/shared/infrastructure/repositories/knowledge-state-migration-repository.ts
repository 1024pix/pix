import { DomainTransaction } from '../../domain/DomainTransaction.js';

const TABLE_NAME = 'knowledge_state_migrations';

/**
 * Gives, among the given users, those whose knowledge is stored as knowledge
 * states.
 */
export const findMigratedUserIds = async ({ userIds }: { userIds: number[] }): Promise<Set<number>> => {
  if (userIds.length === 0) return new Set();

  const migratedUserIds = await DomainTransaction.getConnection()(TABLE_NAME)
    .whereIn('userId', userIds)
    .pluck<number[]>('userId');

  return new Set(migratedUserIds);
};

export const save = async ({ userId, report }: { userId: number; report: object }): Promise<void> => {
  await DomainTransaction.getConnection()(TABLE_NAME).insert({ userId, report: JSON.stringify(report) });
};
