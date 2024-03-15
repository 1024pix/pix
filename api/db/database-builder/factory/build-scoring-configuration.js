import { databaseBuffer } from '../database-buffer.js';

export const buildScoringConfiguration = function ({
  id = databaseBuffer.getNextId(),
  configuration,
  createdAt = new Date('2020-01-01'),
  createdByUserId = 123,
}) {
  return databaseBuffer.pushInsertable({
    tableName: 'certification-scoring-configurations',
    values: {
      id,
      configuration: JSON.stringify(configuration),
      createdAt,
      createdByUserId,
    },
  });
};
