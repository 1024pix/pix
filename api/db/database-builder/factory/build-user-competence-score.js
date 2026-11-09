import { UserCompetenceScore } from '../../../src/shared/domain/models/UserCompetenceScore.ts';
import { databaseBuffer } from '../database-buffer.ts';

const buildUserCompetenceScore = ({ updatedAt = new Date('2020-01-01'), ...fields }) => {
  const userCompetenceScore = new UserCompetenceScore({ ...fields, updatedAt });
  const values = {
    user_id: userCompetenceScore.userId,
    competence_id: userCompetenceScore.competenceId,
    pix: userCompetenceScore.pix,
    updated_at: userCompetenceScore.updatedAt,
  };

  return databaseBuffer.pushInsertable({ tableName: 'user_competence_scores', values });
};

export { buildUserCompetenceScore };
