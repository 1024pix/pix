import { databaseBuffer } from '../database-buffer.ts';

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
