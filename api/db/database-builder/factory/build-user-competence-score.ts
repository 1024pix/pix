import {
  UserCompetenceScore,
  type UserCompetenceScoreType,
} from '../../../src/shared/domain/models/UserCompetenceScore.ts';
import { databaseBuffer } from '../database-buffer.ts';

const buildUserCompetenceScore = ({ updatedAt = new Date('2020-01-01'), ...fields }: UserCompetenceScoreType) => {
  const values = new UserCompetenceScore({ ...fields, updatedAt });

  return databaseBuffer.pushInsertable({ tableName: 'user_competence_scores', values });
};

export { buildUserCompetenceScore };
