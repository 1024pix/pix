import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { UserCompetenceScore, type UserCompetenceScoreType } from '../../domain/models/UserCompetenceScore.ts';

const TABLE_NAME = 'user_competence_scores';

export const findByUserIds = async (userIds: number[]): Promise<UserCompetenceScore[]> => {
  if (userIds.length === 0) return [];

  const rows = await DomainTransaction.getConnection()<UserCompetenceScoreType>(TABLE_NAME).whereIn('userId', userIds);

  return rows.map((row) => new UserCompetenceScore(row));
};

export const save = async (userCompetenceScores: UserCompetenceScore[]): Promise<void> => {
  if (userCompetenceScores.length === 0) return;

  await DomainTransaction.getConnection()(TABLE_NAME)
    .insert(userCompetenceScores.map((userCompetenceScore) => ({ ...userCompetenceScore })))
    .onConflict(['userId', 'competenceId'])
    .merge(['pix', 'updatedAt']);
};
