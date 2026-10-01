import { CompetenceScore } from '../../../src/shared/domain/models/CompetenceScore.ts';
import { databaseBuffer } from '../database-buffer.js';

/**
 * A migrated user's displayed score on one competence.
 */
const buildCompetenceScore = ({ updatedAt = new Date('2020-01-01'), ...fields }) => {
  const values = new CompetenceScore({ ...fields, updatedAt });

  return databaseBuffer.pushInsertable({ tableName: 'competence-scores', values });
};

export { buildCompetenceScore };
