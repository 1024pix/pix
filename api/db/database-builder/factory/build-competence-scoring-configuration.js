import { databaseBuffer } from '../database-buffer.js';

export const buildCompetenceScoringConfiguration = function ({
  id = databaseBuffer.getNextId(),
  configuration,
  createdAt = new Date('2020-01-01'),
  createdByUserId,
}) {
  return databaseBuffer.pushInsertable({
    tableName: 'competence-scoring-configurations',
    values: {
      id,
      configuration: JSON.stringify(configuration),
      createdAt,
      createdByUserId,
    },
  });
};
