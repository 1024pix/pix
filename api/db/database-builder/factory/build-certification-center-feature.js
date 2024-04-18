import { databaseBuffer } from '../database-buffer.js';

const buildCertificationCenterFeature = function buildCertificationCenterFeature({
  id = databaseBuffer.getNextId(),
  certificationCenterId,
  featureId,
  createdAt,
} = {}) {
  const values = {
    id,
    certificationCenterId,
    featureId,
    createdAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification-center-features',
    values,
  });
};

export { buildCertificationCenterFeature };
