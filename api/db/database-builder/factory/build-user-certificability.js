import { databaseBuffer } from '../database-buffer.js';

function buildUserCertificability({
  id = databaseBuffer.getNextId(),
  userId = null,
  certificability = '{}',
  certificabilityV2 = '{}',
  latestKnowledgeElementCreatedAt = new Date('2020-01-01'),
  latestCertificationDeliveredAt = new Date('2020-01-02'),
  latestBadgeAcquisitionUpdatedAt = new Date('2020-01-03'),
  latestComplementaryCertificationBadgeDetachedAt = new Date('2020-01-04'),
  updatedAt = new Date('2001-01-01'),
} = {}) {
  const values = {
    id,
    userId,
    certificability,
    certificabilityV2,
    latestKnowledgeElementCreatedAt,
    latestCertificationDeliveredAt,
    latestBadgeAcquisitionUpdatedAt,
    latestComplementaryCertificationBadgeDetachedAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'user-certificabilities',
    values,
  });
}

export { buildUserCertificability };
