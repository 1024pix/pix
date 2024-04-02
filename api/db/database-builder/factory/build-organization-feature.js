import { databaseBuffer } from '../database-buffer.js';

const buildOrganizationFeature = function buildOrganizationFeature({
  id = databaseBuffer.getNextId(),
  organizationId,
  featureId,
  params,
} = {}) {
  const values = {
    id,
    organizationId,
    featureId,
    params,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-features',
    values,
  });
};

export { buildOrganizationFeature };
