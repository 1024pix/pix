import { databaseBuffer } from '../database-buffer.js';

const buildOrganizationFeature = function buildOrganizationFeature({
  id = databaseBuffer.getNextId(),
  organizationId,
  featureId,
} = {}) {
  const values = {
    id,
    organizationId,
    featureId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-features',
    values,
  });
};

export { buildOrganizationFeature };
