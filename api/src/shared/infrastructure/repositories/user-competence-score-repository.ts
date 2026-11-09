import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { UserCompetenceScore } from '../../domain/models/UserCompetenceScore.ts';

const TABLE_NAME = 'user_competence_scores';

type Row = {
  user_id: number;
  competence_id: string;
  pix: number;
  updated_at: Date;
};

const toRow = (userCompetenceScore: UserCompetenceScore): Row => ({
  user_id: userCompetenceScore.userId,
  competence_id: userCompetenceScore.competenceId,
  pix: userCompetenceScore.pix,
  updated_at: userCompetenceScore.updatedAt,
});

const toDomain = (row: Row): UserCompetenceScore =>
  new UserCompetenceScore({
    userId: row.user_id,
    competenceId: row.competence_id,
    pix: row.pix,
    updatedAt: row.updated_at,
  });

export const findByUserId = async (userId: number): Promise<UserCompetenceScore[]> => {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn<Row>(TABLE_NAME).where({ user_id: userId });

  return rows.map(toDomain);
};

export const findByUserIds = async (userIds: number[]): Promise<UserCompetenceScore[]> => {
  if (userIds.length === 0) return [];

  const rows = await DomainTransaction.getConnection()<Row>(TABLE_NAME).whereIn('user_id', userIds);

  return rows.map(toDomain);
};

export const upsert = async (userCompetenceScores: UserCompetenceScore[]): Promise<void> => {
  if (userCompetenceScores.length === 0) return;

  const knexConn = DomainTransaction.getConnection();
  await knexConn<Row>(TABLE_NAME)
    .insert(userCompetenceScores.map(toRow))
    .onConflict(['user_id', 'competence_id'])
    .merge(['pix', 'updated_at']);
};
