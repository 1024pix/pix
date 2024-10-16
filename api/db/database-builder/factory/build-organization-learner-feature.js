import { databaseBuffer } from '../database-buffer.js';

const buildOrganizationLearnerFeature = function buildOrganizationLearnerFeature({
  id = databaseBuffer.getNextId(),
  organizationLearnerId,
  featureId,
} = {}) {
  const values = {
    id,
    organizationLearnerId,
    featureId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-learner-features',
    values,
  });
};

export { buildOrganizationLearnerFeature };
