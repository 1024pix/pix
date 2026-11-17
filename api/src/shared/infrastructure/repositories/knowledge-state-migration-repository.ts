import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { addCorrelationInfo } from '../execution-context-manager.js';

const TABLE_NAME = 'knowledge_state_migrations';

/**
 * Whether the knowledge of the user is stored as knowledge states.
 * The answer is added to the logs of the current request, to tell the requests
 * served from knowledge states from the others.
 */
export const isMigrated = async (userId: number): Promise<boolean> => {
  const knexConn = DomainTransaction.getConnection();
  const migration = await knexConn<{ userId: number }>(TABLE_NAME).select('userId').where({ userId }).first();
  const isUserMigratedToKnowledgeStates = Boolean(migration);

  addCorrelationInfo('isUserMigratedToKnowledgeStates', isUserMigratedToKnowledgeStates);

  return isUserMigratedToKnowledgeStates;
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
