import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { UserCompetenceScore, type UserCompetenceScoreType } from '../../domain/models/UserCompetenceScore.ts';

const TABLE_NAME = 'user_competence_scores';

export const findByUserId = async (userId: number): Promise<UserCompetenceScore[]> => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<UserCompetenceScoreType>(TABLE_NAME).where({ userId });

  return rows.map((row) => new UserCompetenceScore(row));
};

export const findByUserIds = async (userIds: number[]): Promise<UserCompetenceScore[]> => {
  if (userIds.length === 0) return [];

  const rows = await DomainTransaction.getConnection()<UserCompetenceScoreType>(TABLE_NAME).whereIn('userId', userIds);

  return rows.map((row) => new UserCompetenceScore(row));
};

export const upsert = async (userCompetenceScores: UserCompetenceScore[]): Promise<void> => {
  if (userCompetenceScores.length === 0) return;

  const knexConn = DomainTransaction.getConnection();
  await knexConn(TABLE_NAME)
    .insert(userCompetenceScores.map((userCompetenceScore) => ({ ...userCompetenceScore })))
    .onConflict(['userId', 'competenceId'])
    .merge(['pix', 'updatedAt']);
};
