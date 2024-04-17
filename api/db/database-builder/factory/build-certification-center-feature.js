import { databaseBuffer } from '../database-buffer.js';

const buildCertificationCenterFeature = function buildCertificationCenterFeature({
  id = databaseBuffer.getNextId(),
  certificationCenterId,
  featureId,
} = {}) {
  const values = {
    id,
    certificationCenterId,
    featureId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification-center-features',
    values,
  });
};

export { buildCertificationCenterFeature };
